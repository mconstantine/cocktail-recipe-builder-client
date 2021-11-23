import * as t from 'io-ts'
import { TaskEither } from 'fp-ts/TaskEither'
import { IO } from 'fp-ts/IO'
import { Reader } from 'fp-ts/Reader'
import { taskEither } from 'fp-ts'
import { pipe, flow } from 'fp-ts/function'
import { reportErrors } from './reportErrors'
import { useEffect, useState } from 'react'

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

function request<I, II, O, OO>(
  request: Request<I, II, O, OO>,
  input: I,
): TaskEither<Error, O> {
  const createQuery: IO<string> = () => {
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

  const createBody: IO<string> = () =>
    pipe(input, request.inputCodec.encode, JSON.stringify)

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
            'Content-Type': 'application/json',
            'Accept': 'application/json',
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
      error => error as Error,
    ),
    taskEither.chain(response =>
      taskEither.tryCatch(
        () => response.json(),
        error => error as Error,
      ),
    ),
    taskEither.chain(
      flow(
        request.outputCodec.decode,
        reportErrors,
        taskEither.fromEither,
        taskEither.mapLeft(() => {
          return new Error(`Decoding error from ${request.url}`)
        }),
      ),
    ),
  )
}

interface LoadingQuery {
  type: 'LOADING'
}

interface ReadyQuery<O> {
  type: 'READY'
  data: O
}

interface ErrorQuery<E> {
  type: 'ERROR'
  error: E
}

type Query<E, O> = LoadingQuery | ReadyQuery<O> | ErrorQuery<E>

function loadingQuery(): LoadingQuery {
  return { type: 'LOADING' }
}

function readyQuery<O>(data: O): ReadyQuery<O> {
  return { type: 'READY', data }
}

function errorQuery<E>(error: E): ErrorQuery<E> {
  return { type: 'ERROR', error }
}

export function foldQuery<E, O, R>(
  whenLoading: IO<R>,
  whenError: Reader<E, R>,
  whenReady: Reader<O, R>,
): Reader<Query<E, O>, R> {
  return query => {
    switch (query.type) {
      case 'LOADING':
        return whenLoading()
      case 'ERROR':
        return whenError(query.error)
      case 'READY':
        return whenReady(query.data)
    }
  }
}

function useRequest<I, II, O, OO>(
  r: Request<I, II, O, OO>,
  input: I,
): Query<Error, O> {
  const [query, setQuery] = useState<Query<Error, O>>(loadingQuery())

  useEffect(() => {
    const sendRequest = pipe(
      request(r, input),
      taskEither.bimap(flow(errorQuery, setQuery), flow(readyQuery, setQuery)),
    )

    setQuery(loadingQuery())
    sendRequest()
  }, [input, r])

  return query
}

export function useGet<I, II, O, OO>(
  request: GetRequest<I, II, O, OO>,
  input: I,
) {
  return useRequest(request, input)
}

export function usePost<I, II, O, OO>(
  request: PostRequest<I, II, O, OO>,
  input: I,
) {
  return useRequest(request, input)
}

export function usePut<I, II, O, OO>(
  request: PutRequest<I, II, O, OO>,
  input: I,
) {
  return useRequest(request, input)
}

export function useDelete<I, II, O, OO>(
  request: DeleteRequest<I, II, O, OO>,
  input: I,
) {
  return useRequest(request, input)
}
