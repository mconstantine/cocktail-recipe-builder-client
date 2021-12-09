import { Stack, Typography, List, ListItem, ListItemText } from '@mui/material'
import { Box } from '@mui/system'
import { option } from 'fp-ts'
import { pipe } from 'fp-ts/function'
import { useMemo } from 'react'
import { useParams } from 'react-router'
import { useGet } from '../../api/useApi'
import { CocktailProfileList } from '../../components/CocktailProfileList'
import { ErrorAlert } from '../../components/ErrorAlert'
import { Loading } from '../../components/Loading'
import { ProfileGraph } from '../../components/ProfileGraph/ProfileGraph'
import {
  Breadcrumb,
  useSetBreadcrumbs,
} from '../../contexts/BreadcrumbsContext'
import { getIngredientRanges, query } from '../../globalDomain'
import { getCocktailProfile } from '../../utils/getCocktailProfile'
import { getCocktail } from './api'

export function Cocktail() {
  const params = useParams()
  const [cocktail, reload] = pipe(params.id!, parseInt, getCocktail, useGet)

  const breadcrumbs = useMemo(
    () =>
      pipe(
        cocktail,
        query.map(({ name }) => [
          {
            label: 'Cocktails',
            path: option.some('/cocktails'),
          },
          {
            label: name,
            path: option.none,
          },
        ]),
        query.getOrElse(() => [] as Breadcrumb[]),
      ),
    [cocktail],
  )

  useSetBreadcrumbs(breadcrumbs)

  return pipe(
    cocktail,
    query.fold(
      () => <Loading />,
      () => (
        <ErrorAlert
          message="An error occurred while getting the details of this cocktail."
          onRetry={reload}
        />
      ),
      cocktail => {
        const profile = getCocktailProfile(cocktail)

        return (
          <Stack spacing={4}>
            <Typography variant="h1">{cocktail.name}</Typography>
            <Box>
              <Typography variant="h6">Ingredients</Typography>
              <List>
                {cocktail.ingredients.map(ingredient => (
                  <ListItem key={ingredient.id}>
                    <ListItemText
                      primary={`${ingredient.amount} ${ingredient.unit.unit} ${ingredient.ingredient.name}`}
                      secondary={getIngredientRanges(ingredient.ingredient)}
                    />
                  </ListItem>
                ))}
              </List>
            </Box>
            <ProfileGraph profile={profile} technique={cocktail.technique} />
            <CocktailProfileList
              technique={cocktail.technique}
              profile={profile}
            />
          </Stack>
        )
      },
    ),
  )
}
