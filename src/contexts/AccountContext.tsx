import * as t from 'io-ts'
import { IO } from 'fp-ts/IO'
import { constNull, constVoid, flow, identity, pipe } from 'fp-ts/function'
import {
  createContext,
  PropsWithChildren,
  useContext,
  useEffect,
  useReducer,
} from 'react'
import {
  CommandHookOutput,
  foldCommand,
  makePostRequest,
  usePost,
} from '../api/useApi'
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  TextField,
} from '@mui/material'
import {
  beginLoginAction,
  cancelAction,
  foldAccountState,
  logoutAction,
  reducer,
  setErrorAction,
  setLoginAction,
  setPendingRequestSentAction,
  updateEmailAction,
  updatePasswordAction,
  validateLoggingInState,
} from './AccountContextState'
import { option } from 'fp-ts'
import { NonEmptyString } from 'io-ts-types'
import { unsafeNonEmptyString } from '../globalDomain'
import { useStorage } from './StorageContext'
import { Reader } from 'fp-ts/Reader'

interface AccountContext {
  login: Reader<IO<void>, void>
  withLogin: <I>(command: CommandHookOutput<I>) => CommandHookOutput<I>
  logout: IO<void>
  isLoggedIn: boolean
}

const LoginInput = t.type(
  {
    email: NonEmptyString,
    password: NonEmptyString,
  },
  'LoginInput',
)

const LoginOutput = t.type(
  {
    type: t.literal('bearer'),
    token: NonEmptyString,
  },
  'LoginOutput',
)

const loginCommand = makePostRequest({
  url: '/users/login',
  inputCodec: LoginInput,
  outputCodec: LoginOutput,
})

const AccountContext = createContext<AccountContext>({
  login: constVoid,
  withLogin: identity,
  logout: constVoid,
  isLoggedIn: false,
})

export function useAccount() {
  return useContext(AccountContext)
}

export function AccountProvider(props: PropsWithChildren<{}>) {
  const [state, dispatch] = useReducer(reducer, { type: 'ANONYMOUS' })
  const cancelLogin = () => dispatch(cancelAction())
  const { getStorageValue, setStorageValue, removeStorageValue } = useStorage()

  const logout = () => {
    removeStorageValue('loginToken')
    dispatch(logoutAction())
  }

  const [loginStatus, loginRequest] = usePost(loginCommand, response =>
    dispatch(setLoginAction(response.token)),
  )

  const withLogin = function withLogin<I>(
    command: CommandHookOutput<I>,
  ): CommandHookOutput<I> {
    const [status, request] = command

    return [
      status,
      input =>
        pipe(
          state,
          foldAccountState({
            ANONYMOUS: () => dispatch(beginLoginAction(request, input)),
            LOGGING_IN: constVoid,
            PENDING_REQUEST: constVoid,
            LOGGED_IN: state => request(input, state.token),
          }),
        ),
    ]
  }

  const login = () =>
    pipe(
      state,
      foldAccountState({
        ANONYMOUS: constVoid,
        LOGGED_IN: constVoid,
        PENDING_REQUEST: constVoid,
        LOGGING_IN: flow(
          validateLoggingInState,
          option.fold(constVoid, ({ email, password }) =>
            loginRequest({ email, password }),
          ),
        ),
      }),
    )

  const isLoggedIn = state.type === 'LOGGED_IN'

  const loginStandalone = (callback: IO<void>) =>
    dispatch(beginLoginAction(callback, null))

  useEffect(() => {
    pipe(
      loginStatus,
      foldCommand(
        constVoid,
        () =>
          dispatch(
            setErrorAction(
              unsafeNonEmptyString(
                'Login failed. Please double-check your credentials and try again.',
              ),
            ),
          ),
        () =>
          pipe(
            state,
            foldAccountState({
              ANONYMOUS: constVoid,
              LOGGING_IN: constVoid,
              LOGGED_IN: constVoid,
              PENDING_REQUEST: state => {
                setStorageValue('loginToken', state.token)
                state.pendingRequest(state.pendingRequestInput, state.token)
                dispatch(setPendingRequestSentAction())
              },
            }),
          ),
      ),
    )
  }, [loginStatus, state, setStorageValue])

  useEffect(() => {
    pipe(
      getStorageValue('loginToken'),
      option.fold(constVoid, token => dispatch(setLoginAction(token))),
    )
  }, [getStorageValue])

  return (
    <>
      <AccountContext.Provider
        value={{ login: loginStandalone, withLogin, logout, isLoggedIn }}
      >
        {props.children}
      </AccountContext.Provider>
      {pipe(
        state,
        foldAccountState({
          ANONYMOUS: constNull,
          LOGGED_IN: constNull,
          PENDING_REQUEST: constNull,
          LOGGING_IN: state => (
            <Dialog open onClose={cancelLogin}>
              <DialogTitle>Login</DialogTitle>
              <DialogContent>
                <DialogContentText>Please login to continue</DialogContentText>
                <TextField
                  autoFocus
                  margin="dense"
                  label="Email Address"
                  type="email"
                  fullWidth
                  value={pipe(
                    state.email,
                    option.getOrElse(() => ''),
                  )}
                  onChange={e =>
                    dispatch(updateEmailAction(e.currentTarget.value))
                  }
                />
                <TextField
                  autoFocus
                  margin="dense"
                  label="Password"
                  type="password"
                  fullWidth
                  value={pipe(
                    state.password,
                    option.getOrElse(() => ''),
                  )}
                  onChange={e =>
                    dispatch(updatePasswordAction(e.currentTarget.value))
                  }
                />
                {pipe(
                  state.error,
                  option.fold(constNull, error => (
                    <DialogContentText color="error">{error}</DialogContentText>
                  )),
                )}
              </DialogContent>
              <DialogActions>
                <Button onClick={cancelLogin}>Cancel</Button>
                <Button onClick={login}>Login</Button>
              </DialogActions>
            </Dialog>
          ),
        }),
      )}
    </>
  )
}
