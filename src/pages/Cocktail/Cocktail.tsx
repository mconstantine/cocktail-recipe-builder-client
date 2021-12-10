import { Delete, Edit } from '@mui/icons-material'
import {
  Stack,
  Typography,
  List,
  ListItem,
  ListItemText,
  SpeedDial,
  SpeedDialIcon,
  SpeedDialAction,
} from '@mui/material'
import { Box } from '@mui/system'
import { boolean, option } from 'fp-ts'
import { constVoid, flow, pipe } from 'fp-ts/function'
import { Option } from 'fp-ts/Option'
import { useEffect, useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router'
import { foldCommand, useDelete, useLazyGet, usePut } from '../../api/useApi'
import {
  deletingState,
  editingState,
  foldState,
  showingState,
  State,
} from '../../common/EntityState'
import { CocktailForm } from '../../components/CocktailForm/CocktailForm'
import { CocktailProfileList } from '../../components/CocktailProfileList'
import { ErrorAlert } from '../../components/ErrorAlert'
import { Loading } from '../../components/Loading'
import { ProfileGraph } from '../../components/ProfileGraph/ProfileGraph'
import {
  Breadcrumb,
  useSetBreadcrumbs,
} from '../../contexts/BreadcrumbsContext'
import { Cocktail as CocktailCodec } from '../../globalDomain'
import { useConfirmationDialog } from '../../hooks/useConfirmationDialog'
import { getCocktailProfile } from '../../utils/getCocktailProfile'
import { ingredientRangesToString } from '../../utils/ingredientRangesToString'
import { deleteCocktail, getCocktail, updateCocktail } from './api'

export function Cocktail() {
  const navigate = useNavigate()
  const params = useParams()
  const id = parseInt(params.id!)
  const [state, setState] = useState<State>(showingState())

  const [cocktail, setCocktail] = useState<Option<CocktailCodec>>(option.none)

  const [, fetchCocktail] = useLazyGet(
    getCocktail(id),
    flow(option.some, setCocktail),
  )

  const [deleteStatus, deleteCommand] = useDelete(deleteCocktail(id), () =>
    navigate('/cocktails'),
  )

  const updateCocktailCommand = usePut(updateCocktail(id), cocktail => {
    setState(showingState())
    setCocktail(option.some(cocktail))
  })

  const [deleteDialog, openDeleteDialog] = useConfirmationDialog(
    'Are you sure?',
    'This will delete the ingredient and all the cocktails made with it.',
    deleteCommand,
  )

  const breadcrumbs = useMemo(
    () =>
      pipe(
        cocktail,
        option.map(({ name }) => [
          {
            label: 'Cocktails',
            path: option.some('/cocktails'),
          },
          {
            label: name,
            path: option.none,
          },
        ]),
        option.getOrElse(() => [] as Breadcrumb[]),
      ),
    [cocktail],
  )

  useSetBreadcrumbs(breadcrumbs)

  useEffect(() => {
    fetchCocktail()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    pipe(
      deleteStatus,
      foldCommand(
        () => setState(deletingState(false)),
        () => setState(deletingState(true)),
        constVoid,
      ),
    )
  }, [deleteStatus, navigate])

  return pipe(
    cocktail,
    option.fold(
      () => <Loading />,
      cocktail =>
        pipe(
          state,
          foldState({
            Error: () => (
              <ErrorAlert
                message="Something went wrong while getting the details for this cocktail."
                onRetry={fetchCocktail}
              />
            ),
            Showing: () => {
              const profile = getCocktailProfile(cocktail)

              return (
                <Stack spacing={4}>
                  <Typography variant="h1">{cocktail.name}</Typography>
                  <Box>
                    <Typography variant="h6">Ingredients</Typography>
                    <List>
                      {cocktail.ingredients.map(ingredient => (
                        <ListItem key={ingredient.ingredient.id}>
                          <ListItemText
                            primary={`${ingredient.amount} ${ingredient.unit.unit} ${ingredient.ingredient.name}`}
                            secondary={ingredientRangesToString(
                              ingredient.ingredient,
                            )}
                          />
                        </ListItem>
                      ))}
                    </List>
                  </Box>
                  <ProfileGraph
                    profile={profile}
                    technique={cocktail.technique}
                  />
                  <CocktailProfileList
                    technique={cocktail.technique}
                    profile={profile}
                  />
                  <SpeedDial
                    ariaLabel="actions"
                    icon={<SpeedDialIcon />}
                    sx={{ position: 'fixed', right: 16, bottom: 16 }}
                  >
                    <SpeedDialAction
                      icon={<Edit />}
                      tooltipTitle="Edit"
                      onClick={() => setState(editingState())}
                    />
                    <SpeedDialAction
                      icon={<Delete />}
                      tooltipTitle="Delete"
                      onClick={openDeleteDialog}
                    />
                  </SpeedDial>
                  {deleteDialog}
                </Stack>
              )
            },
            Editing: () => (
              <CocktailForm
                cocktail={option.some(cocktail)}
                command={updateCocktailCommand}
                onCancel={() => setState(showingState())}
                submitLabel="Update"
              />
            ),
            Deleting: ({ error }) =>
              pipe(
                error,
                boolean.fold(
                  () => (
                    <Loading>
                      <Typography>Deleting "{cocktail.name}"…</Typography>
                    </Loading>
                  ),
                  () => (
                    <ErrorAlert
                      message="An error occurred while deleting the cocktail."
                      onRetry={() => setState(showingState())}
                      retryLabel="Back"
                    />
                  ),
                ),
              ),
          }),
        ),
    ),
  )
}
