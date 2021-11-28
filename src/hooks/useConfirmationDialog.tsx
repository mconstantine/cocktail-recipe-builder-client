import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
} from '@mui/material'
import { IO } from 'fp-ts/IO'
import { ReactNode, useState } from 'react'

export function useConfirmationDialog(
  title: string,
  message: string,
  onConfirm: IO<unknown>,
): [Dialog: ReactNode, action: IO<void>] {
  const [isOpen, setIsOpen] = useState(false)
  const onOpen = () => setIsOpen(true)
  const onClose = () => setIsOpen(false)

  return [
    <Dialog
      open={isOpen}
      onClose={onClose}
      aria-labelledby={title}
      aria-describedby={message}
    >
      <DialogTitle>{title}</DialogTitle>
      <DialogContent>
        <DialogContentText>{message}</DialogContentText>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} autoFocus>
          No
        </Button>
        <Button onClick={onConfirm}>Yes</Button>
      </DialogActions>
    </Dialog>,
    onOpen,
  ]
}
