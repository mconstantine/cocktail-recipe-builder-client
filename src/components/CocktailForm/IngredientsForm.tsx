import { Add, Delete, Save } from '@mui/icons-material'
import {
  Autocomplete,
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
import { option } from 'fp-ts'
import { constNull, pipe, flow, constVoid, constFalse } from 'fp-ts/function'
import { Reader } from 'fp-ts/Reader'
import { NonEmptyString } from 'io-ts-types'
import { useReducer, useState } from 'react'
import { useGet } from '../../api/useApi'
import { getIngredientRanges, query, Unit } from '../../globalDomain'
import { useDebounce } from '../../hooks/useDebounce'
import { CocktailIngredient } from '../../pages/Cocktail/domain'
import { getUnits } from '../../pages/CreateCocktail/api'
import { getIngredients } from '../../pages/Ingredients/api'
import {
  IngredientsInput,
  IngredientsOutput,
} from '../../pages/Ingredients/domain'
import { NumberField } from '../NumberField'
import {
  cancelAction,
  foldState,
  importAction,
  reducer,
  saveAction,
  startAction,
  stateToCocktailIngredient,
  updateAmountAction,
  updateIngredientAction,
  updateUnitAction,
  validateState,
} from './IngredientsFormState'

interface Props {
  ingredients: CocktailIngredient[]
  onChange: Reader<CocktailIngredient[], unknown>
  disabled?: boolean
}

export function IngredientsForm(props: Props) {
  const [state, dispatch] = useReducer(reducer, { type: 'READY' })

  const isStateValid = pipe(
    state,
    foldState({
      READY: constFalse,
      ADDING: flow(validateState, option.isSome),
    }),
  )

  const [ingredientsQuery, setIngredientsQuery] = useState<IngredientsInput>({
    page: 1,
    perPage: 10,
    query: option.none,
  })

  const [updateIngredientsQuery, isLoadingIngredients] = useDebounce(
    (query: string) =>
      setIngredientsQuery(currentQuery => ({
        ...currentQuery,
        query: pipe(query, NonEmptyString.decode, option.fromEither),
      })),
    500,
  )

  const [ingredients] = useGet(getIngredients, ingredientsQuery)
  const [units] = useGet(getUnits)

  const onAddIngredientClick = () => {
    pipe(
      state,
      foldState({
        READY: constVoid,
        ADDING: flow(
          validateState,
          option.fold(constVoid, state =>
            props.onChange([
              ...props.ingredients.filter(i => i.id !== state.ingredient.id),
              stateToCocktailIngredient(state),
            ]),
          ),
        ),
      }),
    )

    dispatch(saveAction())
  }

  const onDeleteIngredientClick = (ingredient: CocktailIngredient) => {
    props.onChange(
      props.ingredients.filter(
        i => i.ingredient.id !== ingredient.ingredient.id,
      ),
    )
  }

  return (
    <Stack spacing={4}>
      <Typography variant="h6">Ingredients:</Typography>
      {props.ingredients.length ? (
        <List>
          {props.ingredients.map(ingredient => (
            <ListItem
              key={ingredient.id}
              secondaryAction={
                <IconButton
                  edge="end"
                  aria-label="delete"
                  disabled={props.disabled}
                  onClick={() => onDeleteIngredientClick(ingredient)}
                >
                  <Delete />
                </IconButton>
              }
            >
              <ListItemButton
                onClick={() => dispatch(importAction(ingredient))}
                disabled={props.disabled}
              >
                <ListItemText
                  primary={`${ingredient.amount}${ingredient.unit.unit} ${ingredient.ingredient.name}`}
                  secondary={getIngredientRanges(ingredient.ingredient)}
                />
              </ListItemButton>
            </ListItem>
          ))}
        </List>
      ) : null}
      {pipe(
        state,
        foldState({
          READY: constNull,
          ADDING: ({ ingredient, amount, unit }) => (
            <>
              <Autocomplete
                options={pipe(
                  ingredients,
                  query.map(({ data }) => data),
                  query.getOrElse(() => [] as IngredientsOutput['data']),
                )}
                getOptionLabel={({ name }) => name}
                renderInput={params => (
                  <TextField {...params} label="Ingredient" required />
                )}
                value={pipe(ingredient, option.toNullable)}
                onInputChange={(_, query) => updateIngredientsQuery(query)}
                loading={isLoadingIngredients || query.isLoading(ingredients)}
                onChange={(_, value) =>
                  value && dispatch(updateIngredientAction(value))
                }
                disabled={props.disabled}
                renderOption={(props, option) => (
                  <ListItem {...props}>
                    <ListItemText
                      primary={`${option.name}`}
                      secondary={getIngredientRanges(option)}
                    />
                  </ListItem>
                )}
              />
              <NumberField
                label="Amount"
                value={pipe(
                  amount,
                  option.getOrElse(() => 0),
                )}
                onChange={flow(updateAmountAction, dispatch)}
                min={0}
                disabled={props.disabled}
              />
              <Autocomplete
                options={pipe(
                  units,
                  query.getOrElse(() => [] as Unit[]),
                )}
                getOptionLabel={({ unit }) => unit}
                renderInput={params => (
                  <TextField {...params} label="Unit" required />
                )}
                value={pipe(unit, option.toNullable)}
                loading={query.isLoading(units)}
                onChange={(_, value) =>
                  value && dispatch(updateUnitAction(value))
                }
                disabled={props.disabled}
              />
              <Stack direction="row" spacing={2}>
                <Button
                  variant="outlined"
                  startIcon={<Save />}
                  onClick={onAddIngredientClick}
                  disabled={props.disabled || !isStateValid}
                >
                  Save
                </Button>
                <Button
                  color="inherit"
                  onClick={() => dispatch(cancelAction())}
                >
                  Close
                </Button>
              </Stack>
            </>
          ),
        }),
      )}
      <Box>
        {pipe(
          state,
          foldState({
            READY: () => (
              <Button
                variant="outlined"
                startIcon={<Add />}
                onClick={() => dispatch(startAction())}
                disabled={props.disabled}
              >
                Add
              </Button>
            ),
            ADDING: constNull,
          }),
        )}
      </Box>
    </Stack>
  )
}
