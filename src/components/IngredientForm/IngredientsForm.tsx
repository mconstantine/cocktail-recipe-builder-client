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
import { either, option } from 'fp-ts'
import { constNull, pipe, flow, constVoid, constFalse } from 'fp-ts/function'
import { Reader } from 'fp-ts/Reader'
import { NonEmptyString } from 'io-ts-types'
import { useReducer, useState } from 'react'
import { query } from '../../api/api'
import { useGet } from '../../api/useApi'
import {
  NonNegative,
  unsafeNonNegative,
  unsafeNonNegativeInteger,
  IngredientIngredient,
  IngredientUnit,
} from '../../globalDomain'
import { useDebounce } from '../../hooks/useDebounce'
import { getUnits } from '../../pages/CreateCocktail/api'
import { getIngredients } from '../../pages/Ingredients/api'
import {
  IngredientsInput,
  IngredientsOutput,
} from '../../pages/Ingredients/domain'
import { ingredientRangesToString } from '../../utils/ingredientRangesToString'
import { NumberField } from '../NumberField'
import {
  close,
  foldState,
  importAction,
  reducer,
  saveAction,
  openAction,
  stateToCocktailIngredient,
  updateAmountAction,
  updateIngredientAction,
  updateUnitAction,
  validateState,
  State,
} from './IngredientsFormState'

interface Props {
  ingredients: IngredientIngredient[]
  onChange: Reader<IngredientIngredient[], unknown>
  disabled?: boolean
}

export function IngredientsForm(props: Props) {
  const [state, dispatch] = useReducer(reducer, { type: 'READY' })

  const isStateValid = pipe(
    state,
    foldState({
      READY: constFalse,
      ADDING: state => pipe(validateState(state), option.isSome),
      EDITING: state => pipe(validateState(state), option.isSome),
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
        ADDING: state =>
          pipe(
            validateState(state),
            option.fold(constVoid, state => {
              props.onChange([
                ...props.ingredients,
                stateToCocktailIngredient(state),
              ])
              dispatch(close())
            }),
          ),
        EDITING: flow(
          validateState,
          option.fold(constVoid, state => {
            props.onChange(
              props.ingredients.map((ingredient, index) => {
                if (index === state.originalIngredientIndex) {
                  return stateToCocktailIngredient(state)
                } else {
                  return ingredient
                }
              }),
            )

            dispatch(close())
          }),
        ),
      }),
    )

    dispatch(saveAction())
  }

  const onDeleteIngredientClick = (ingredient: IngredientIngredient) => {
    props.onChange(
      props.ingredients.filter(
        i => i.ingredient.id !== ingredient.ingredient.id,
      ),
    )
  }

  const renderForm = ({
    ingredient,
    amount,
    unit,
  }: Omit<Extract<State, { type: 'ADDING' }>, 'type'>) => (
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
              secondary={ingredientRangesToString(option)}
            />
          </ListItem>
        )}
      />
      <NumberField
        label="Amount"
        value={pipe(
          amount,
          option.getOrElse(() => unsafeNonNegative(0)),
        )}
        onChange={flow(
          NonNegative.decode,
          either.bimap(constVoid, flow(updateAmountAction, dispatch)),
        )}
        min={0}
        disabled={props.disabled}
      />
      <Autocomplete
        options={pipe(
          units,
          query.getOrElse(() => [] as IngredientUnit[]),
        )}
        getOptionLabel={({ unit }) => unit}
        renderInput={params => <TextField {...params} label="Unit" required />}
        value={pipe(unit, option.toNullable)}
        loading={query.isLoading(units)}
        onChange={(_, value) => value && dispatch(updateUnitAction(value))}
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
        <Button color="inherit" onClick={() => dispatch(close())}>
          Close
        </Button>
      </Stack>
    </>
  )

  return (
    <Stack spacing={2}>
      <Typography variant="h6">Ingredients:</Typography>
      {props.ingredients.length ? (
        <List>
          {props.ingredients.map((ingredient, index) => (
            <ListItem
              key={ingredient.ingredient.id}
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
                onClick={() =>
                  dispatch(
                    importAction(ingredient, unsafeNonNegativeInteger(index)),
                  )
                }
                disabled={props.disabled}
              >
                <ListItemText
                  primary={`${ingredient.amount}${ingredient.unit.unit} ${ingredient.ingredient.name}`}
                  secondary={ingredientRangesToString(ingredient.ingredient)}
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
          ADDING: renderForm,
          EDITING: renderForm,
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
                onClick={() => dispatch(openAction())}
                disabled={props.disabled}
              >
                Add
              </Button>
            ),
            ADDING: constNull,
            EDITING: constNull,
          }),
        )}
      </Box>
    </Stack>
  )
}
