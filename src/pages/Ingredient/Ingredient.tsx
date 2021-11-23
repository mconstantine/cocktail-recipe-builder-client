import {
  Breadcrumbs,
  Link as MUILink,
  List,
  ListItem,
  ListItemText,
  Stack,
  Typography,
} from '@mui/material'
import { pipe } from 'fp-ts/function'
import { useParams } from 'react-router'
import { foldQuery, useGet } from '../../api/useApi'
import { ErrorAlert } from '../../components/ErrorAlert'
import { Link } from '../../components/Link'
import { Loading } from '../../components/Loading'
import { getIngredient } from './api'

export function Ingredient() {
  const params = useParams()
  const [ingredient, reload] = pipe(params.id!, parseInt, getIngredient, useGet)

  return pipe(
    ingredient,
    foldQuery(
      () => <Loading />,
      () => (
        <ErrorAlert
          message="Something went wrong while getting the details for this ingredient."
          onRetry={reload}
        />
      ),
      ingredient => (
        <Stack>
          <Breadcrumbs aria-label="breadcrumb">
            <MUILink href="/ingredients" component={Link}>
              Ingredients
            </MUILink>
            <Typography color="text.primary">{ingredient.name}</Typography>
          </Breadcrumbs>
          <Typography variant="h1">{ingredient.name}</Typography>
          <List>
            {ingredient.ranges.map(range => (
              <ListItem key={range.id}>
                <ListItemText
                  primary={`${range.amount}${range.unit.unit}`}
                  secondary={range.unit.name}
                />
              </ListItem>
            ))}
          </List>
        </Stack>
      ),
    ),
  )
}
