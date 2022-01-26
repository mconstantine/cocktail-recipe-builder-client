import { AppBar, Button, Container, CssBaseline, Toolbar } from '@mui/material'
import { Box } from '@mui/system'
import { option } from 'fp-ts'
import { constNull, pipe } from 'fp-ts/function'
import { Fragment, ReactElement } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAccount } from '../contexts/AccountContext'
import { useRenderBreadcrumbs } from '../contexts/BreadcrumbsContext'

interface Props {
  children: ReactElement
}

export function Header(props: Props) {
  const renderBreadcrumbs = useRenderBreadcrumbs()
  const { login, isLoggedIn } = useAccount()
  const navigate = useNavigate()
  const doLogin = () => login(() => navigate('/profile'))

  return (
    <Fragment>
      <CssBaseline />
      <AppBar position="sticky">
        <Toolbar sx={{ justifyContent: 'flex-end' }}>
          <Button color="inherit">
            <Link to="/cocktails">Cocktails</Link>
          </Button>
          <Button color="inherit">
            <Link to="/ingredients">Ingredients</Link>
          </Button>
          {isLoggedIn ? (
            <Button color="inherit">
              <Link to="/profile">Profile</Link>
            </Button>
          ) : (
            <Button color="inherit" onClick={doLogin}>
              Login
            </Button>
          )}
        </Toolbar>
        {pipe(
          renderBreadcrumbs(),
          option.fold(constNull, breadcrumbs => (
            <Toolbar>{breadcrumbs}</Toolbar>
          )),
        )}
      </AppBar>
      <Container>
        <Box sx={{ my: 6 }}>{props.children}</Box>
      </Container>
    </Fragment>
  )
}
