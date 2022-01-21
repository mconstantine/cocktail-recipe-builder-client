import * as t from 'io-ts'
import { TaskEither } from 'fp-ts/TaskEither'
import { IO } from 'fp-ts/IO'
import { Reader } from 'fp-ts/Reader'
import { option, taskEither } from 'fp-ts'
import { pipe, flow } from 'fp-ts/function'
import { reportErrors } from './reportErrors'
import { useEffect, useState } from 'react'
import { query } from './api'
import { Query } from './Query'
import { NonEmptyString } from 'io-ts-types'
import { Option } from 'fp-ts/Option'
import { KnownErrorCode, ResponseError } from './apiDomain'
import { unsafeNonEmptyString } from '../globalDomain'

const API_URL = process.env['REACT_APP_API_URL']?.replace(/\/?$/, '')

if (!API_URL) {
  throw new Error('Environment does not contain REACT_APP_API_URL')
}

const HttpMethod = t.keyof({
  GET: true,
  POST: true,
  PUT: true,
  DELETE: true,
})
type HttpMethod = t.TypeOf<typeof HttpMethod>

function foldHttpMethod<O>(
  cases: Record<HttpMethod, IO<O>>,
): Reader<HttpMethod, O> {
  return method => cases[method]()
}

interface Request<I, II, O, OO> {
  method: HttpMethod
  url: string
  inputCodec: t.Type<I, II>
  outputCodec: t.Type<O, OO>
}

interface GetRequest<I, II, O, OO>
  extends Omit<Request<I, II, O, OO>, 'method'> {
  method: 'GET'
}
export function makeGetRequest<I, II, O, OO>(
  request: Omit<Request<I, II, O, OO>, 'method'>,
): GetRequest<I, II, O, OO> {
  return { ...request, method: 'GET' }
}

interface PostRequest<I, II, O, OO>
  extends Omit<Request<I, II, O, OO>, 'method'> {
  method: 'POST'
}
export function makePostRequest<I, II, O, OO>(
  request: Omit<Request<I, II, O, OO>, 'method'>,
): PostRequest<I, II, O, OO> {
  return { ...request, method: 'POST' }
}

interface PutRequest<I, II, O, OO>
  extends Omit<Request<I, II, O, OO>, 'method'> {
  method: 'PUT'
}
export function makePutRequest<I, II, O, OO>(
  request: Omit<Request<I, II, O, OO>, 'method'>,
): PutRequest<I, II, O, OO> {
  return { ...request, method: 'PUT' }
}

interface DeleteRequest<I, II, O, OO>
  extends Omit<Request<I, II, O, OO>, 'method'> {
  method: 'DELETE'
}
export function makeDeleteRequest<I, II, O, OO>(
  request: Omit<Request<I, II, O, OO>, 'method'>,
): DeleteRequest<I, II, O, OO> {
  return { ...request, method: 'DELETE' }
}

export interface HandledResponseError extends ResponseError {
  code: KnownErrorCode
}

function makeRequest<I, II, O, OO>(
  request: Request<I, II, O, OO>,
  token: Option<NonEmptyString>,
  input?: I,
): TaskEither<HandledResponseError, O> {
  const createQuery: IO<string> = () => {
    if (input === undefined) {
      return ''
    }

    return pipe(
      input,
      request.inputCodec.encode,
      data =>
        '?' +
        Object.entries(data)
          .filter(([, value]) => value !== null)
          .map(([key, value]) => [
            encodeURIComponent(key),
            encodeURIComponent(value),
          ])
          .map(([key, value]) => `${key}=${value}`)
          .join('&'),
    )
  }

  const createBody: IO<string> = () => {
    if (input === undefined) {
      return ''
    }

    return pipe(input, request.inputCodec.encode, JSON.stringify)
  }

  const query = pipe(
    request.method,
    foldHttpMethod({
      GET: createQuery,
      POST: () => '',
      PUT: () => '',
      DELETE: createQuery,
    }),
  )

  return pipe(
    taskEither.tryCatch(
      () =>
        window.fetch(`${API_URL}${request.url}${query}`, {
          method: request.method,
          headers: {
            ...{
              'Content-Type': 'application/json',
              'Accept': 'application/json',
            },
            ...pipe(
              token,
              option.fold(
                () => ({}),
                token => ({ Authorization: `Bearer ${token}` }),
              ),
            ),
          },
          body: pipe(
            request.method,
            foldHttpMethod({
              GET: () => undefined,
              POST: createBody,
              PUT: createBody,
              DELETE: () => undefined,
            }),
          ),
        }),
      (error): HandledResponseError => {
        console.log(error)

        return {
          code: 500,
          errors: [
            {
              message: unsafeNonEmptyString('Unable to fetch data'),
            },
          ],
        }
      },
    ),
    taskEither.chain(response =>
      pipe(
        taskEither.tryCatch(
          () => response.json(),
          (error): HandledResponseError => {
            console.log(error)

            return {
              code: 500,
              errors: [
                {
                  message: unsafeNonEmptyString(
                    'Unable to parse response to JSON',
                  ),
                },
              ],
            }
          },
        ),
        taskEither.chain(data => {
          if (
            Object.keys(KnownErrorCode.keys).includes(
              response.status.toString(),
            )
          ) {
            return pipe(
              ResponseError.decode(data),
              taskEither.fromEither,
              taskEither.bimap(
                (): HandledResponseError => ({
                  code: 500,
                  errors: [
                    {
                      message: unsafeNonEmptyString(
                        'Unable to decode error response',
                      ),
                    },
                  ],
                }),
                ({ errors }): HandledResponseError => ({
                  code: response.status as KnownErrorCode,
                  errors,
                }),
              ),
              taskEither.chain(taskEither.left),
            )
          }

          return taskEither.right(data)
        }),
      ),
    ),
    taskEither.chain(
      flow(
        request.outputCodec.decode,
        reportErrors,
        taskEither.fromEither,
        taskEither.mapLeft(
          (): HandledResponseError => ({
            code: 500,
            errors: [
              {
                message: unsafeNonEmptyString(
                  `Decoding error from ${request.url}`,
                ),
              },
            ],
          }),
        ),
      ),
    ),
  )
}

export type QueryHookOutput<T> = [
  query: Query<HandledResponseError, T>,
  reload: IO<void>,
]

function useQuery<I, II, O, OO>(
  request: Request<I, II, O, OO>,
  input?: I,
): QueryHookOutput<O> {
  const [queryState, setQueryState] = useState<Query<HandledResponseError, O>>(
    query.loading(),
  )

  const makeSendRequest = (request: Request<I, II, O, OO>, input?: I) =>
    pipe(
      makeRequest(request, option.none, input),
      taskEither.bimap(
        flow(query.left, setQueryState),
        flow(query.right, setQueryState),
      ),
    )

  const reloadQuery = (request: Request<I, II, O, OO>, input?: I) => {
    const sendRequest = makeSendRequest(request, input)

    setQueryState(query.loading())
    sendRequest()
  }

  useEffect(() => {
    reloadQuery(request, input)
    // eslint-disable-next-line
  }, [input])

  return [queryState, () => reloadQuery(request, input)]
}

interface ReadyCommand {
  type: 'READY'
}

interface LoadingCommand {
  type: 'LOADING'
}

interface ErrorCommand<E> {
  type: 'ERROR'
  error: E
}

type Command<E> = ReadyCommand | LoadingCommand | ErrorCommand<E>

function readyCommand(): ReadyCommand {
  return { type: 'READY' }
}

function loadingCommand(): LoadingCommand {
  return { type: 'LOADING' }
}

function errorCommand<E>(error: E): ErrorCommand<E> {
  return { type: 'ERROR', error }
}

export function foldCommand<E, R>(
  whenLoading: IO<R>,
  whenError: Reader<E, R>,
  whenReady: IO<R>,
): Reader<Command<E>, R> {
  return command => {
    switch (command.type) {
      case 'LOADING':
        return whenLoading()
      case 'ERROR':
        return whenError(command.error)
      case 'READY':
        return whenReady()
    }
  }
}

export type CommandHookOutput<I> = [
  status: Command<HandledResponseError>,
  command: (input: I, token?: NonEmptyString) => void,
]

function useCommand<I, II, O, OO>(
  request: Request<I, II, O, OO>,
  onSuccess: Reader<O, unknown>,
): CommandHookOutput<I> {
  const [status, setStatus] = useState<Command<HandledResponseError>>(
    readyCommand(),
  )

  const command = (input: I, token?: NonEmptyString) => {
    setStatus(loadingCommand())

    pipe(
      makeRequest(request, option.fromNullable(token), input),
      taskEither.bimap(flow(errorCommand, setStatus), data => {
        setStatus(readyCommand())
        onSuccess(data)
      }),
    )()
  }

  return [status, command]
}

export function useGet<I, II, O, OO>(
  request: GetRequest<I, II, O, OO>,
  input?: I,
) {
  return useQuery(request, input)
}

export function useLazyGet<I, II, O, OO>(
  request: GetRequest<I, II, O, OO>,
  onSuccess: Reader<O, unknown>,
) {
  return useCommand(request, onSuccess)
}

export function usePost<I, II, O, OO>(
  request: PostRequest<I, II, O, OO>,
  onSuccess: Reader<O, unknown>,
) {
  return useCommand(request, onSuccess)
}

export function usePut<I, II, O, OO>(
  request: PutRequest<I, II, O, OO>,
  onSuccess: Reader<O, unknown>,
) {
  return useCommand(request, onSuccess)
}

export function useDelete<I, II, O, OO>(
  request: DeleteRequest<I, II, O, OO>,
  onSuccess: Reader<O, unknown>,
) {
  return useCommand(request, onSuccess)
}
