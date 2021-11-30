import { Stack, Typography, List, ListItem, ListItemText } from '@mui/material'
import { Box } from '@mui/system'
import { option } from 'fp-ts'
import { pipe } from 'fp-ts/function'
import { useMemo } from 'react'
import { useParams } from 'react-router'
import { foldQuery, useGet } from '../../api/useApi'
import { ErrorAlert } from '../../components/ErrorAlert'
import { Loading } from '../../components/Loading'
import { ProfileGraph } from '../../components/ProfileGraph/ProfileGraph'
import { useSetBreadcrumbs } from '../../contexts/BreadcrumbsContext'
import { getCocktailProfile } from '../../utils/getCocktailProfile'
import { getCocktail } from './api'

export function Cocktail() {
  const params = useParams()
  const [cocktail, reload] = pipe(params.id!, parseInt, getCocktail, useGet)

  const breadcrumbs = useMemo(
    () =>
      pipe(
        cocktail,
        foldQuery(
          () => [],
          () => [],
          ({ name }) => [
            {
              label: 'Cocktails',
              path: option.some('/cocktails'),
            },
            {
              label: name,
              path: option.none,
            },
          ],
        ),
      ),
    [cocktail],
  )

  useSetBreadcrumbs(breadcrumbs)

  return pipe(
    cocktail,
    foldQuery(
      () => <Loading />,
      () => (
        <ErrorAlert
          message="An error occurred while getting the details of this cocktail."
          onRetry={reload}
        />
      ),
      cocktail => {
        const profile = getCocktailProfile(cocktail)
        const dilutionAddendum = 1 + profile.dilution / 100
        const volumeMl = profile.volumeMl * dilutionAddendum
        const volumeOz = volumeMl / 30
        const abv = profile.abv / dilutionAddendum
        const sugarContentPct = profile.sugarContentPct / dilutionAddendum
        const acidContentPct = profile.acidContentPct / dilutionAddendum

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
                      secondary={ingredient.ingredient.ranges
                        .map(
                          range =>
                            `${range.amount}${range.unit.unit} ${range.unit.name}`,
                        )
                        .join(', ')}
                    />
                  </ListItem>
                ))}
              </List>
            </Box>
            <Box>
              <ProfileGraph profile={profile} technique={cocktail.technique} />
            </Box>
            <Box>
              <Typography variant="h6">Profile</Typography>
              <List>
                <ListItem>
                  <ListItemText
                    primary={cocktail.technique.name}
                    secondary="Technique"
                  />
                </ListItem>
                <ListItem>
                  <ListItemText
                    primary={`${volumeMl.toFixed(2)} ml (${volumeOz.toFixed(
                      2,
                    )} oz)`}
                    secondary="Volume"
                  />
                </ListItem>
                <ListItem>
                  <ListItemText
                    primary={`${abv.toFixed(2)}%`}
                    secondary="ABV"
                  />
                </ListItem>
                <ListItem>
                  <ListItemText
                    primary={`${sugarContentPct.toFixed(2)}%`}
                    secondary="Sugar content"
                  />
                </ListItem>
                <ListItem>
                  <ListItemText
                    primary={`${acidContentPct.toFixed(2)}%`}
                    secondary="Acid content"
                  />
                </ListItem>
                <ListItem>
                  <ListItemText
                    primary={`${profile.dilution.toFixed(2)}%`}
                    secondary="Dilution"
                  />
                </ListItem>
              </List>
            </Box>
          </Stack>
        )
      },
    ),
  )
}
