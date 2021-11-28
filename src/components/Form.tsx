import { Button, Stack } from '@mui/material'
import { IO } from 'fp-ts/IO'
import { ComponentProps, PropsWithChildren } from 'react'

interface Props
  extends Omit<PropsWithChildren<ComponentProps<'form'>>, 'onSubmit'> {
  onSubmit: IO<unknown>
  onCancel: IO<unknown>
  submitLabel: string
  disabled?: boolean
}

export function Form(props: Props) {
  const { submitLabel, disabled, ...formProps } = props

  const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    props.onSubmit()
  }

  return (
    <form {...formProps} onSubmit={onSubmit}>
      <Stack spacing={4} sx={{ maxWidth: 720 }}>
        {props.children}
        <Stack direction="row" spacing={2}>
          <Button variant="outlined" type="submit" disabled={disabled}>
            {props.submitLabel}
          </Button>
          <Button color="inherit" disabled={disabled} onClick={props.onCancel}>
            Cancel
          </Button>
        </Stack>
      </Stack>
    </form>
  )
}
