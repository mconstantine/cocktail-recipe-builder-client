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
import { boolean, option } from 'fp-ts'
import { constVoid, flow, pipe } from 'fp-ts/function'
import { useEffect, useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router'
import { foldCommand, useDelete, useLazyGet, usePut } from '../../api/useApi'
import { ErrorAlert } from '../../components/ErrorAlert'
import { Loading } from '../../components/Loading'
import { useSetBreadcrumbs } from '../../contexts/BreadcrumbsContext'
import { deleteIngredient, getIngredient, updateIngredient } from './api'
import { Delete, Edit } from '@mui/icons-material'
import { IngredientForm } from '../../components/IngredientForm'
import { useConfirmationDialog } from '../../hooks/useConfirmationDialog'
import {
  deletingState,
  editingState,
  foldState,
  showingState,
  State,
} from './state'
import { Option } from 'fp-ts/Option'
import { Ingredient as IngredientType } from './domain'

export function Ingredient() {
  const navigate = useNavigate()
  const params = useParams()
  const id = parseInt(params.id!)
  const [state, setState] = useState<State>(showingState())

  const [ingredient, setIngredient] = useState<Option<IngredientType>>(
    option.none,
  )

  const [, fetchIngredient] = useLazyGet(
    getIngredient(id),
    flow(option.some, setIngredient),
  )

  const updateIngredientCommand = usePut(updateIngredient(id), inredient => {
    setState(showingState())
    setIngredient(option.some(inredient))
  })

  const [deleteStatus, deleteCommand] = useDelete(deleteIngredient(id), () =>
    navigate('/ingredients'),
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
