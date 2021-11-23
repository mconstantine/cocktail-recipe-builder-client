import { CircularProgress } from '@mui/material'
import { Box } from '@mui/system'

export function Loading() {
  return (
    <Box sx={{ display: 'flex', justifyContent: 'center' }}>
      <CircularProgress />
    </Box>
  )
}
