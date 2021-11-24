import { List, ListItem, ListItemText, Stack, Typography } from '@mui/material'
import { option } from 'fp-ts'
import { pipe } from 'fp-ts/function'
import { useMemo } from 'react'
import { useParams } from 'react-router'
import { foldQuery, useGet } from '../../api/useApi'
import { ErrorAlert } from '../../components/ErrorAlert'
import { Loading } from '../../components/Loading'
import { useSetBreadcrumbs } from '../../contexts/BreadcrumbsContext'
import { getIngredient } from './api'

export function Ingredient() {
  const params = useParams()
  const [ingredient, reload] = pipe(params.id!, parseInt, getIngredient, useGet)

  const breadcrumbs = useMemo(
    () =>
      pipe(
        ingredient,
        foldQuery(
          () => [],
          () => [],
          ({ name }) => [
            {
              label: 'Ingredients',
              path: option.some('/ingredients'),
            },
            {
              label: name,
              path: option.none,
            },
          ],
        ),
      ),
    [ingredient],
  )

  useSetBreadcrumbs(breadcrumbs)

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
