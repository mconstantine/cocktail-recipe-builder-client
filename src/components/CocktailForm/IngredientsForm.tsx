import { Add, Delete } from '@mui/icons-material'
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
import { constNull, pipe, flow } from 'fp-ts/function'
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
  isStateValid,
  reducer,
  saveAction,
  startAction,
  State,
  stateToCocktailIngredient,
  updateAmountAction,
  updateIngredientAction,
  updateUnitAction,
} from './IngredientsFormState'

interface Props {
  ingredients: CocktailIngredient[]
  onChange: Reader<CocktailIngredient[], unknown>
  disabled?: boolean
}

export function IngredientsForm(props: Props) {
  const [state, dispatch] = useReducer(reducer, { type: 'READY' })

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

  const onAddIngredientClick = (ingredient: CocktailIngredient) => {
    props.onChange([
      ...props.ingredients.filter(
        i => i.ingredient.id !== ingredient.ingredient.id,
      ),
      ingredient,
    ])
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
            // TODO: this could be an actual form
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
            ADDING: state => (
              <Stack direction="row" spacing={2}>
                <AddIngredientButton
                  state={state}
                  onClick={onAddIngredientClick}
                  disabled={props.disabled}
                />
                <Button
                  color="inherit"
                  variant="text"
                  onClick={() => dispatch(cancelAction())}
                  disabled={props.disabled}
                >
                  Close
                </Button>
              </Stack>
            ),
          }),
        )}
      </Box>
    </Stack>
  )
}

interface AddIngredientButtonProps {
  state: Extract<State, { type: 'ADDING' }>
  onClick: Reader<CocktailIngredient, unknown>
  disabled?: boolean
}

function AddIngredientButton(props: AddIngredientButtonProps) {
  const addIngredient = () => {
    if (!isStateValid(props.state)) {
      return
    }

    props.onClick(stateToCocktailIngredient(props.state))
  }

  return (
    <Button
      variant="outlined"
      startIcon={<Add />}
      disabled={!isStateValid(props.state) || props.disabled}
      onClick={addIngredient}
    >
      Add
    </Button>
  )
}
