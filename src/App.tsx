import { Outlet } from 'react-router-dom'
import { Header } from './components/Header'
import { ThemeProvider, createTheme, responsiveFontSizes } from '@mui/material'
import { useEffect, useState } from 'react'
import { BreadcrumbsProvider } from './contexts/BreadcrumbsContext'
import { AccountProvider } from './contexts/AccountContext'
import { StorageProvider } from './contexts/StorageContext'

export function App() {
  const shouldBeDark =
    window.matchMedia &&
    window.matchMedia('(prefers-color-scheme: dark)').matches

  const makeTheme = (mode: 'light' | 'dark') =>
    responsiveFontSizes(createTheme({ palette: { mode } }))

  useEffect(() => {
    const onThemeChange = (e: MediaQueryListEvent) => {
      setTheme(makeTheme(e.matches ? 'dark' : 'light'))
    }

    window
      .matchMedia('(prefers-color-scheme: dark)')
      .addEventListener('change', onThemeChange)

    return () => {
      window
        .matchMedia('(prefers-color-scheme: dark)')
        .removeEventListener('change', onThemeChange)
    }
  }, [])

  const [theme, setTheme] = useState(
    responsiveFontSizes(
      createTheme({
        palette: {
          mode: shouldBeDark ? 'dark' : 'light',
        },
      }),
    ),
  )

  return (
    <StorageProvider>
      <AccountProvider>
        <ThemeProvider theme={theme}>
          <BreadcrumbsProvider>
            <Header>
              <Outlet />
            </Header>
          </BreadcrumbsProvider>
        </ThemeProvider>
      </AccountProvider>
    </StorageProvider>
  )
}
