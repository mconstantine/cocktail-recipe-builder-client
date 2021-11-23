import { Outlet } from 'react-router-dom'
import { Header } from './components/Header'
import { ThemeProvider, createTheme } from '@mui/material'

export function App() {
  const theme = createTheme({
    palette: {
      mode: 'dark',
    },
  })

  return (
    <ThemeProvider theme={theme}>
      <Header>
        <Outlet />
      </Header>
    </ThemeProvider>
  )
}
