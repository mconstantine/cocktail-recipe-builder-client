import { Stack, Typography } from '@mui/material'

export function Home() {
  return (
    <Stack spacing={4}>
      <Typography variant="h1">Cocktail recipe builder</Typography>
      <Typography>
        Welcome to the cocktail recipe builder by{' '}
        <a href="https://www.mconst.it" target="_blank">
          Mauro Constantinescu
        </a>
        . Use the menu up above to start exploring!
      </Typography>
    </Stack>
  )
}
