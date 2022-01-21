import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  Stack,
  TextField,
  Typography,
} from '@mui/material'
import { either } from 'fp-ts'
import {
  constFalse,
  constNull,
  constTrue,
  constVoid,
  pipe,
} from 'fp-ts/function'
import { NonEmptyString } from 'io-ts-types'
import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { foldCommand, usePost, usePut } from '../../api/useApi'
import { ErrorAlert } from '../../components/ErrorAlert'
import { Loading } from '../../components/Loading'
import { useAccount } from '../../contexts/AccountContext'
import { useConfirmationDialog } from '../../hooks/useConfirmationDialog'
import { logoutUser, updateProfile } from './api'

export function Profile() {
  const navigate = useNavigate()
  const { useLogin, logout, isLoggedIn } = useAccount()
  const [isNewPasswordDialogVisible, setIsNewPasswordDialogVisible] =
    useState(false)
  const [newPassword, setNewPassword] = useState('')

  const [logoutStatus, sendLogoutRequest] = useLogin(
    usePost(logoutUser, logout),
  )

  const [isLoggingOutFromEverywhere, setIsLoggingOutFromEverywhere] =
    useState(false)

  const doLogout = () => {
    setIsLoggingOutFromEverywhere(false)
    sendLogoutRequest({ logout_from_everywhere: false })
  }

  const [logoutFromEverywhereConfirmationDialog, doLogoutFromEverywhere] =
    useConfirmationDialog(
      'Are you sure?',
      'You will be logged out from all devices.',
      () => {
        setIsLoggingOutFromEverywhere(true)
        sendLogoutRequest({ logout_from_everywhere: true })
      },
    )

  const hideNewPasswordDialog = () => setIsNewPasswordDialogVisible(false)

  const [updateProfileStatus, updateProfileCommand] = useLogin(
    usePut(updateProfile, hideNewPasswordDialog),
  )

  const isUpdateProfileUIDisabled = pipe(
    updateProfileStatus,
    foldCommand(constTrue, constFalse, constFalse),
  )

  const sendUpdateProfileRequest = () =>
    pipe(
      newPassword,
      NonEmptyString.decode,
      either.fold(constVoid, newPassword =>
        updateProfileCommand({ new_password: newPassword }),
      ),
    )

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
                  onClick={() => setIsNewPasswordDialogVisible(true)}
                >
                  <ListItemText>Change password</ListItemText>
                </ListItemButton>
              </ListItem>
            </List>
          ),
        ),
      )}
      {logoutFromEverywhereConfirmationDialog}
      <Dialog open={isNewPasswordDialogVisible} onClose={hideNewPasswordDialog}>
        <DialogTitle>Change password</DialogTitle>
        <DialogContent>
          <DialogContentText>Type your new password</DialogContentText>
          <TextField
            autoFocus
            margin="dense"
            label="Password"
            type="password"
            fullWidth
            value={newPassword}
            onChange={e => setNewPassword(e.currentTarget.value)}
          />
          {pipe(
            updateProfileStatus,
            foldCommand(
              constNull,
              () => (
                <DialogContentText color="error">
                  There has been an error while updating your profile. Please
                  try again.
                </DialogContentText>
              ),
              constNull,
            ),
          )}
        </DialogContent>
        <DialogActions>
          <Button
            onClick={hideNewPasswordDialog}
            disabled={isUpdateProfileUIDisabled}
          >
            Cancel
          </Button>
          <Button
            onClick={sendUpdateProfileRequest}
            disabled={isUpdateProfileUIDisabled}
          >
            Update
          </Button>
        </DialogActions>
      </Dialog>
    </Stack>
  )
}
