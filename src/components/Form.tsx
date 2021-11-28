import { Button, Stack } from '@mui/material'
import { Box } from '@mui/system'
import { IO } from 'fp-ts/IO'
import { ComponentProps, PropsWithChildren } from 'react'

interface Props
  extends Omit<PropsWithChildren<ComponentProps<'form'>>, 'onSubmit'> {
  onSubmit: IO<unknown>
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
        <Box>
          <Button type="submit" disabled={disabled}>
            {props.submitLabel}
          </Button>
        </Box>
      </Stack>
    </form>
  )
}
