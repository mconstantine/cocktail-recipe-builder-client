import { Add, ArrowUpward, Delete, Save } from '@mui/icons-material'
import {
  Button,
  IconButton,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  Stack,
  TextField,
  Typography,
} from '@mui/material'
import { Box } from '@mui/system'
import { either, option } from 'fp-ts'
import { constNull, constVoid, flow, pipe } from 'fp-ts/function'
import { Reader } from 'fp-ts/Reader'
import { Option } from 'fp-ts/Option'
import { NonEmptyString } from 'io-ts-types'
import { useEffect, useReducer } from 'react'
import { Cocktail } from '../../globalDomain'
import {
  addStep,
  cancel,
  deleteStep,
  editStep,
  eqState,
  foldState,
  moveUp,
  newStep,
  reducer,
  saveStep,
  stateFromCocktail,
  updateStepInput,
} from './CocktailRecipeFormState'
import { NonEmptyArray } from 'fp-ts/NonEmptyArray'
import { usePrevious } from '../../hooks/usePrevious'

interface Props {
  cocktail: Option<Cocktail>
  onChange: Reader<Option<NonEmptyArray<NonEmptyString>>, unknown>
}

export function CocktailRecipeForm(props: Props) {
  const [state, dispatch] = useReducer(
    reducer,
    stateFromCocktail(props.cocktail),
  )

  const previousState = usePrevious(state)
  const { onChange } = props

  useEffect(() => {
    if (eqState.equals(state, previousState) || state.type !== 'DEFAULT') {
      return
    }

    onChange(state.steps)
  }, [state, previousState, onChange])

  return (
    <>
      <Typography variant="h6">Recipe:</Typography>
      {pipe(
        state.steps,
        option.fold(constNull, steps => (
          <List>
            {steps.map((step, index) => (
              <ListItem
                key={index}
                secondaryAction={
                  <Stack direction="row" spacing={2}>
                    <IconButton
                      edge="end"
                      aria-label="move up"
                      onClick={() => dispatch(moveUp(index))}
                      disabled={index === 0 || state.type !== 'DEFAULT'}
                    >
                      <ArrowUpward />
                    </IconButton>
                    <IconButton
                      edge="end"
                      aria-label="delete"
                      onClick={() => dispatch(deleteStep(index))}
                      disabled={state.type !== 'DEFAULT'}
                    >
                      <Delete />
                    </IconButton>
                  </Stack>
                }
              >
                <ListItemButton
                  key={index}
                  onClick={() => dispatch(editStep(index))}
                  disabled={state.type !== 'DEFAULT'}
                >
                  <ListItemText primary={step} />
                </ListItemButton>
              </ListItem>
            ))}
          </List>
        )),
      )}
      {pipe(
        state,
        foldState({
          DEFAULT: () => (
            <Box>
              <Button
                variant="outlined"
                startIcon={<Add />}
                onClick={() => dispatch(newStep())}
              >
                Add step
              </Button>
            </Box>
          ),
          ADDING: state => (
            <Stack spacing={4}>
              <TextField
                label="Instruction"
                value={state.currentStep}
                onChange={e => dispatch(updateStepInput(e.currentTarget.value))}
              />
              <Stack direction="row" spacing={2}>
                <Button
                  variant="outlined"
                  startIcon={<Add />}
                  onClick={() =>
                    pipe(
                      state.currentStep,
                      NonEmptyString.decode,
                      either.bimap(constVoid, flow(addStep, dispatch)),
                    )
                  }
                  disabled={pipe(
                    state.currentStep,
                    NonEmptyString.decode,
                    either.isLeft,
                  )}
                >
                  Add
                </Button>
                <Button
                  variant="text"
                  color="inherit"
                  onClick={() => dispatch(cancel())}
                >
                  Cancel
                </Button>
              </Stack>
            </Stack>
          ),
          EDITING: state => (
            <Stack spacing={4}>
              <TextField
                label="Instruction"
                value={state.currentStep}
                onChange={e => dispatch(updateStepInput(e.currentTarget.value))}
              />
              <Stack direction="row" spacing={2}>
                <Button
                  variant="outlined"
                  startIcon={<Save />}
                  onClick={() =>
                    pipe(
                      state.currentStep,
                      NonEmptyString.decode,
                      either.bimap(constVoid, flow(saveStep, dispatch)),
                    )
                  }
                  disabled={pipe(
                    state.currentStep,
                    NonEmptyString.decode,
                    either.isLeft,
                  )}
                >
                  Save
                </Button>
                <Button
                  variant="text"
                  color="inherit"
                  onClick={() => dispatch(cancel())}
                >
                  Cancel
                </Button>
              </Stack>
            </Stack>
          ),
        }),
      )}
    </>
  )
}
