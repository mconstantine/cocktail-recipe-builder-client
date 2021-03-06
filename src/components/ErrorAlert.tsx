import { Alert, AlertTitle, Button } from '@mui/material'
import { IO } from 'fp-ts/IO'

interface Props {
  title?: string
  message: string
  onRetry?: IO<void>
  retryLabel?: string
}

export function ErrorAlert(props: Props) {
  return (
    <Alert
      severity="error"
      action={
        props.onRetry ? (
          <Button color="inherit" size="small" onClick={props.onRetry}>
            {props.retryLabel || 'Retry'}
          </Button>
        ) : null
      }
    >
      <AlertTitle>{props.title || 'Error'}</AlertTitle>
      {props.message}
    </Alert>
  )
}
