import {
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  Stack,
  Typography,
} from '@mui/material'
import { pipe } from 'fp-ts/function'
import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { foldCommand, usePost } from '../../api/useApi'
import { ErrorAlert } from '../../components/ErrorAlert'
import { Loading } from '../../components/Loading'
import { useAccount } from '../../contexts/AccountContext'
import { logoutUser } from './api'

export function Profile() {
  /*
  Functionalities:
  [ ] Change password
  [x] Logout
  [ ] Logout from everywhere
  */

  const navigate = useNavigate()
  const { useLogin, logout, isLoggedIn } = useAccount()

  const [logoutStatus, sendLogoutRequest] = useLogin(
    usePost(logoutUser, logout),
  )

  const [isLoggingOutFromEverywhere, setIsLoggingOutFromEverywhere] =
    useState(false)

  const doLogout = () => {
    setIsLoggingOutFromEverywhere(false)
    sendLogoutRequest({ logout_from_everywhere: false })
  }

  const doLogoutFromEverywhere = () => {
    setIsLoggingOutFromEverywhere(true)
    sendLogoutRequest({ logout_from_everywhere: true })
  }

  useEffect(() => {
    if (!isLoggedIn) {
      navigate('/')
    }
  }, [isLoggedIn, navigate])

  return (
    <Stack spacing={4}>
      <Typography variant="h1">Profile</Typography>
      {pipe(
        logoutStatus,
        foldCommand(
          () => <Loading />,
          () => (
            <ErrorAlert
              message="An error occurred while logging out."
              onRetry={() =>
                sendLogoutRequest({
                  logout_from_everywhere: isLoggingOutFromEverywhere,
                })
              }
            />
          ),
          () => (
            <List>
              <ListItem>
                <ListItemButton onClick={doLogout}>
                  <ListItemText>Logout</ListItemText>
                </ListItemButton>
              </ListItem>
              <ListItem>
                <ListItemButton onClick={doLogoutFromEverywhere}>
                  <ListItemText>Logout from everywhere</ListItemText>
                </ListItemButton>
              </ListItem>
              <ListItem>
                <ListItemButton
                  onClick={() => console.log('TODO: change password')}
                >
                  <ListItemText>Change password</ListItemText>
                </ListItemButton>
              </ListItem>
            </List>
          ),
        ),
      )}
    </Stack>
  )
}
