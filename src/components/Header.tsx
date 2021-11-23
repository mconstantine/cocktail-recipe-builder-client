import {
  AppBar,
  Button,
  Container,
  CssBaseline,
  Slide,
  Toolbar,
  Typography,
  useScrollTrigger,
} from '@mui/material'
import { Box } from '@mui/system'
import { Fragment, ReactElement } from 'react'
import { Link } from 'react-router-dom'

interface Props {
  children: ReactElement
}

export function Header(props: Props) {
  const trigger = useScrollTrigger({
    target: window,
  })

  return (
    <Fragment>
      <CssBaseline />
      <Slide appear={false} direction="down" in={!trigger}>
        <AppBar position="fixed">
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
        </AppBar>
      </Slide>
      <Toolbar />
      <Container>
        <Box sx={{ my: 6 }}>{props.children}</Box>
      </Container>
    </Fragment>
  )
}
