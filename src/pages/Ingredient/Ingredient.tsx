import {
  List,
  ListItem,
  ListItemText,
  SpeedDial,
  SpeedDialAction,
  SpeedDialIcon,
  Stack,
  Typography,
} from '@mui/material'
import { boolean, nonEmptyArray, option } from 'fp-ts'
import { constVoid, flow, pipe } from 'fp-ts/function'
import { useEffect, useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router'
import { foldCommand, useDelete, useLazyGet, usePut } from '../../api/useApi'
import { ErrorAlert } from '../../components/ErrorAlert'
import { Loading } from '../../components/Loading'
import { useSetBreadcrumbs } from '../../contexts/BreadcrumbsContext'
import { deleteIngredient, getIngredient, updateIngredient } from './api'
import { Delete, Edit } from '@mui/icons-material'
import { IngredientForm } from '../../components/IngredientForm/IngredientForm'
import { useConfirmationDialog } from '../../hooks/useConfirmationDialog'
import {
  deletingState,
  editingState,
  foldState,
  showingState,
  State,
} from '../../common/EntityState'
import { Option } from 'fp-ts/Option'
import { Ingredient as IngredientCodec } from '../../globalDomain'
import { TabBar } from '../../components/TabBar'
import { ingredientRangesToString } from '../../utils/ingredientRangesToString'
import { Box } from '@mui/system'
import { useAccount } from '../../contexts/AccountContext'

export function Ingredient() {
  const navigate = useNavigate()
  const params = useParams()
  const id = parseInt(params.id!)
  const [state, setState] = useState<State>(showingState())

  const [ingredient, setIngredient] = useState<Option<IngredientCodec>>(
    option.none,
  )

  const [, fetchIngredient] = useLazyGet(
    getIngredient(id),
    flow(option.some, setIngredient),
  )

  const { withLogin } = useAccount()

  const updateIngredientCommand = withLogin(
    usePut(updateIngredient(id), ingredient => {
      setState(showingState())
      setIngredient(option.some(ingredient))
    }),
  )

  const [deleteStatus, deleteCommand] = withLogin(
    useDelete(deleteIngredient(id), () => navigate('/ingredients')),
  )

  const [deleteDialog, openDeleteDialog] = useConfirmationDialog(
    'Are you sure?',
    'This will delete the ingredient and all the cocktails made with it.',
    deleteCommand,
  )

  const breadcrumbs = useMemo(
    () =>
      pipe(
        ingredient,
        option.fold(
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

  useEffect(() => {
    fetchIngredient()
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
    ingredient,
    option.fold(
      () => <Loading />,
      ingredient =>
        pipe(
          state,
          foldState({
            Error: () => (
              <ErrorAlert
                message="Something went wrong while getting the details for this ingredient."
                onRetry={fetchIngredient}
              />
            ),
            Showing: () => (
              <>
                <TabBar
                  content={{
                    Profile: (
                      <Stack spacing={4}>
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
                    Recipe: (
                      <Stack spacing={4}>
                        <Typography variant="h1">{ingredient.name}</Typography>
                        <Box>
                          <Typography variant="h6">Ingredients</Typography>
                          {pipe(
                            ingredient.ingredients,
                            nonEmptyArray.fromArray,
                            option.fold(
                              () => (
                                <Typography>
                                  There are no ingredients for this ingredient.
                                </Typography>
                              ),
                              ingredients => (
                                <List>
                                  {ingredients.map(ingredient => (
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
                              ),
                            ),
                          )}
                        </Box>
                        <Box>
                          <Typography variant="h6">Recipe</Typography>
                          {pipe(
                            ingredient.recipe,
                            nonEmptyArray.fromArray,
                            option.fold(
                              () => (
                                <Typography>
                                  There is no recipe for this ingredient.
                                </Typography>
                              ),
                              ingredients => (
                                <List>
                                  {ingredients.map(step => (
                                    <ListItem key={step.index}>
                                      <ListItemText primary={step.step} />
                                    </ListItem>
                                  ))}
                                </List>
                              ),
                            ),
                          )}
                        </Box>
                      </Stack>
                    ),
                  }}
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
              </>
            ),
            Editing: () => (
              <IngredientForm
                ingredient={option.some(ingredient)}
                command={updateIngredientCommand}
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
                      <Typography>Deleting "{ingredient.name}"…</Typography>
                    </Loading>
                  ),
                  () => (
                    <ErrorAlert
                      message="An error occurred while deleting the ingredient."
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
