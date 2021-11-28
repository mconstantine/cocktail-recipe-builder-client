import { CircularProgress, Stack } from '@mui/material'
import { PropsWithChildren } from 'react'

export function Loading(props: PropsWithChildren<{}>) {
  return (
    <Stack spacing={2} alignItems="center">
      <CircularProgress />
      {props.children}
    </Stack>
  )
}
