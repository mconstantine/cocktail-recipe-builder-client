import {
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  Stack,
  Typography,
} from '@mui/material'
import { pipe } from 'fp-ts/function'
import { useEffect } from 'react'
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
  const { withLogin, logout, isLoggedIn } = useAccount()
  const [logoutStatus, logoutRequest] = withLogin(usePost(logoutUser, logout))

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
          error => {
            console.log(error)
            return (
              <ErrorAlert
                message="An error occurred while logging out."
                onRetry={logoutRequest}
              />
            )
          },
          () => (
            <List>
              <ListItem>
                <ListItemButton onClick={() => logoutRequest()}>
                  <ListItemText>Logout</ListItemText>
                </ListItemButton>
              </ListItem>
              <ListItem>
                <ListItemButton
                  onClick={() => console.log('TODO: logout from everywhere')}
                >
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
