import { option } from 'fp-ts'
import { pipe } from 'fp-ts/function'
import { sequenceS } from 'fp-ts/Apply'
import { Option } from 'fp-ts/Option'
import { Reader } from 'fp-ts/Reader'
import { NonEmptyString } from 'io-ts-types'

interface AnonymousState {
  type: 'ANONYMOUS'
}

interface PendingRequest<I> {
  request: (input: I, token?: NonEmptyString) => void
  input: I
}

interface LoggingInState {
  type: 'LOGGING_IN'
  email: Option<NonEmptyString>
  password: Option<NonEmptyString>
  pendingRequest: PendingRequest<any>
  error: Option<NonEmptyString>
}

interface PendingRequestState {
  type: 'PENDING_REQUEST'
  pendingRequest: PendingRequest<any>
  token: NonEmptyString
}

interface LoggedInState {
  type: 'LOGGED_IN'
  token: NonEmptyString
  lastRequest: Option<PendingRequest<any>>
}

type AccountState =
  | AnonymousState
  | LoggingInState
  | PendingRequestState
  | LoggedInState

export function foldAccountState<T>(cases: {
  [k in AccountState['type']]: Reader<Extract<AccountState, { type: k }>, T>
}): Reader<AccountState, T> {
  return accountState => cases[accountState.type](accountState as any)
}

interface ValidLoggingInState
  extends Omit<LoggingInState, 'email' | 'password'> {
  email: NonEmptyString
  password: NonEmptyString
}

export function validateLoggingInState(
  state: LoggingInState,
): Option<ValidLoggingInState> {
  return pipe(
    {
      email: state.email,
      password: state.password,
    },
    sequenceS(option.Apply),
    option.map(data => ({ ...state, ...data })),
  )
}

interface BeginLoginAction {
  type: 'BEGIN_LOGIN'
  pendingRequest: PendingRequest<any>
}

export function beginLoginAction<I>(
  pendingRequest: Reader<I, void>,
  pendingRequestInput: I,
): BeginLoginAction {
  return {
    type: 'BEGIN_LOGIN',
    pendingRequest: {
      request: pendingRequest,
      input: pendingRequestInput,
    },
  }
}

interface UpdateEmailAction {
  type: 'UPDATE_EMAIL'
  email: string
}

export function updateEmailAction(email: string): UpdateEmailAction {
  return {
    type: 'UPDATE_EMAIL',
    email,
  }
}

interface UpdatePasswordAction {
  type: 'UPDATE_PASSWORD'
  password: string
}

export function updatePasswordAction(password: string): UpdatePasswordAction {
  return {
    type: 'UPDATE_PASSWORD',
    password,
  }
}

interface SetErrorAction {
  type: 'SET_ERROR'
  error: NonEmptyString
}

export function setErrorAction(error: NonEmptyString): SetErrorAction {
  return {
    type: 'SET_ERROR',
    error,
  }
}

interface SetLoginAction {
  type: 'SET_LOGIN'
  token: NonEmptyString
}

export function setLoginAction(token: NonEmptyString): SetLoginAction {
  return {
    type: 'SET_LOGIN',
    token,
  }
}

interface SetPendingRequestSentAction {
  type: 'SET_PENDING_REQUEST_SENT'
}

export function setPendingRequestSentAction(): SetPendingRequestSentAction {
  return {
    type: 'SET_PENDING_REQUEST_SENT',
  }
}

interface LogoutAction {
  type: 'LOGOUT'
}

export function logoutAction(): LogoutAction {
  return { type: 'LOGOUT' }
}

interface CancelAction {
  type: 'CANCEL'
}

export function cancelAction(): CancelAction {
  return { type: 'CANCEL' }
}

interface UpdateLastRequestAction {
  type: 'UPDATE_LAST_REQUEST'
  lastRequest: PendingRequest<any>
}

export function updateLastRequestAction<I>(
  lastRequest: Reader<I, void>,
  input: I,
): UpdateLastRequestAction {
  return {
    type: 'UPDATE_LAST_REQUEST',
    lastRequest: {
      request: lastRequest,
      input,
    },
  }
}

type AccountAction =
  | BeginLoginAction
  | UpdateEmailAction
  | UpdatePasswordAction
  | SetLoginAction
  | LogoutAction
  | CancelAction
  | SetErrorAction
  | SetPendingRequestSentAction
  | UpdateLastRequestAction

export function reducer(
  state: AccountState,
  action: AccountAction,
): AccountState {
  switch (state.type) {
    case 'ANONYMOUS':
      switch (action.type) {
        case 'BEGIN_LOGIN':
          return {
            type: 'LOGGING_IN',
            pendingRequest: action.pendingRequest,
            email: option.none,
            password: option.none,
            error: option.none,
          }
        case 'SET_LOGIN':
          return {
            type: 'LOGGED_IN',
            token: action.token,
            lastRequest: option.none,
          }
        case 'UPDATE_EMAIL':
        case 'UPDATE_PASSWORD':
        case 'LOGOUT':
        case 'CANCEL':
        case 'SET_ERROR':
        case 'SET_PENDING_REQUEST_SENT':
        case 'UPDATE_LAST_REQUEST':
          return state
      }
    case 'LOGGING_IN':
      switch (action.type) {
        case 'UPDATE_EMAIL':
          return {
            ...state,
            email: pipe(action.email, NonEmptyString.decode, option.fromEither),
            error: option.none,
          }
        case 'UPDATE_PASSWORD':
          return {
            ...state,
            password: pipe(
              action.password,
              NonEmptyString.decode,
              option.fromEither,
            ),
            error: option.none,
          }
        case 'SET_LOGIN':
          return {
            type: 'PENDING_REQUEST',
            pendingRequest: state.pendingRequest,
            token: action.token,
          }
        case 'SET_ERROR':
          return {
            ...state,
            error: option.some(action.error),
          }
        case 'CANCEL':
          return { type: 'ANONYMOUS' }
        case 'BEGIN_LOGIN':
        case 'LOGOUT':
        case 'SET_PENDING_REQUEST_SENT':
        case 'UPDATE_LAST_REQUEST':
          return state
      }
    case 'PENDING_REQUEST':
      switch (action.type) {
        case 'SET_PENDING_REQUEST_SENT':
          return {
            type: 'LOGGED_IN',
            token: state.token,
            lastRequest: option.some(state.pendingRequest),
          }
        case 'BEGIN_LOGIN':
        case 'UPDATE_EMAIL':
        case 'UPDATE_PASSWORD':
        case 'SET_ERROR':
        case 'LOGOUT':
        case 'SET_LOGIN':
        case 'CANCEL':
        case 'UPDATE_LAST_REQUEST':
          return state
      }
    case 'LOGGED_IN':
      switch (action.type) {
        case 'LOGOUT':
          return { type: 'ANONYMOUS' }
        case 'UPDATE_LAST_REQUEST':
          return {
            ...state,
            lastRequest: option.some(action.lastRequest),
          }
        case 'BEGIN_LOGIN':
          return {
            type: 'LOGGING_IN',
            pendingRequest: action.pendingRequest,
            email: option.none,
            password: option.none,
            error: option.none,
          }
        case 'UPDATE_EMAIL':
        case 'UPDATE_PASSWORD':
        case 'SET_LOGIN':
        case 'SET_ERROR':
        case 'SET_PENDING_REQUEST_SENT':
        case 'CANCEL':
          return state
      }
  }
}
