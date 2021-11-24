import {
  AppBar,
  Button,
  Container,
  CssBaseline,
  Toolbar,
  Typography,
} from '@mui/material'
import { Box } from '@mui/system'
import { option } from 'fp-ts'
import { constNull, pipe } from 'fp-ts/function'
import { Fragment, ReactElement } from 'react'
import { Link } from 'react-router-dom'
import { useRenderBreadcrumbs } from '../contexts/BreadcrumbsContext'

interface Props {
  children: ReactElement
}

export function Header(props: Props) {
  const renderBreadcrumbs = useRenderBreadcrumbs()

  return (
    <Fragment>
      <CssBaseline />
      <AppBar position="sticky">
        <Toolbar>
          <Typography variant="h6" sx={{ flexGrow: 1 }}>
            CRB
          </Typography>
          <Button color="inherit">
            <Link to="/cocktails">Cocktails</Link>
          </Button>
          <Button color="inherit">
            <Link to="/ingredients">Ingredients</Link>
          </Button>
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
