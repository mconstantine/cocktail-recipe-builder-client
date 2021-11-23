import { Outlet } from 'react-router-dom'
import { Header } from './components/Header'
import { ThemeProvider, createTheme, responsiveFontSizes } from '@mui/material'

export function App() {
  const theme = responsiveFontSizes(
    createTheme({
      palette: {
        mode: 'dark',
      },
    }),
  )

  return (
    <ThemeProvider theme={theme}>
      <Header>
        <Outlet />
      </Header>
    </ThemeProvider>
  )
}
