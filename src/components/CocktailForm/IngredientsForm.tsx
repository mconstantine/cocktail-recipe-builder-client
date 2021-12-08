import { Add, Save } from '@mui/icons-material'
import {
  Autocomplete,
  Button,
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
import { query, Unit } from '../../globalDomain'
import { useDebounce } from '../../hooks/useDebounce'
import { getUnits } from '../../pages/CreateCocktail/api'
import { CocktailIngredientInput } from '../../pages/CreateCocktail/domain'
import { getIngredients } from '../../pages/Ingredients/api'
import {
  IngredientsInput,
  IngredientsOutput,
} from '../../pages/Ingredients/domain'
import { NumberField } from '../NumberField'
import {
  foldState,
  isStateValid,
  reducer,
  startAction,
  updateAmountAction,
  updateIngredientAction,
  updateUnitAction,
} from './IngredientsFormState'

interface Props {
  ingredients: CocktailIngredientInput[]
  onChange: Reader<CocktailIngredientInput[], unknown>
}

export function IngredientsForm(_props: Props) {
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

  return (
    <Stack spacing={4}>
      <Typography variant="h6">Ingredients:</Typography>
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
              />
              <NumberField
                label="Amount"
                value={pipe(
                  amount,
                  option.getOrElse(() => 0),
                )}
                onChange={flow(updateAmountAction, dispatch)}
                min={0}
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
              >
                Add
              </Button>
            ),
            ADDING: state => (
              <Button
                variant="outlined"
                startIcon={<Save />}
                disabled={!isStateValid(state)}
                onClick={() => console.log('TODO: should call props.onChange')}
              >
                Save
              </Button>
            ),
          }),
        )}
      </Box>
    </Stack>
  )
}
