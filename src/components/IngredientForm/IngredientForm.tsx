import { Divider, TextField } from '@mui/material'
import { nonEmptyArray, option } from 'fp-ts'
import {
  constFalse,
  constNull,
  constTrue,
  constVoid,
  flow,
  pipe,
} from 'fp-ts/function'
import { Option } from 'fp-ts/Option'
import { useReducer } from 'react'
import { IngredientInput } from '../../pages/CreateIngredient/domain'
import { Form } from '../Form'
import { PercentageField } from '../PercentageField'
import { CommandHookOutput, foldCommand } from '../../api/useApi'
import { ErrorAlert } from '../ErrorAlert'
import { IO } from 'fp-ts/IO'
import { Ingredient, IngredientIngredient } from '../../globalDomain'
import {
  emptyState,
  ingredientToState,
  reducer,
  stateToIngredientInput,
  updateAbv,
  updateAcid,
  updateIngredients,
  updateName,
  updateRecipe,
  updateSugar,
  validateState,
} from './IngredientFormState'
import { IngredientsForm } from './IngredientsForm'
import { NonEmptyArray } from 'fp-ts/NonEmptyArray'
import { NonEmptyString } from 'io-ts-types'
import { RecipeForm } from '../RecipeForm/RecipeForm'

interface Props {
  ingredient: Option<Ingredient>
  command: CommandHookOutput<IngredientInput>
  onCancel: IO<unknown>
  submitLabel: string
}

export function IngredientForm(props: Props) {
  const [status, submit] = props.command

  const [state, dispatch] = useReducer(
    reducer,
    pipe(
      props.ingredient,
      option.fold(() => emptyState(), ingredientToState),
    ),
  )

  const isStateValid = option.isSome(validateState(state))

  const isDisabled = pipe(
    status,
    foldCommand(constTrue, constFalse, constFalse),
  )

  const onIngredientsChange = (ingredients: IngredientIngredient[]) =>
    dispatch(updateIngredients(ingredients))

  const onRecipeChange = (recipe: Option<NonEmptyArray<NonEmptyString>>) =>
    dispatch(updateRecipe(recipe))

  const onSubmit = () =>
    pipe(
      state,
      validateState,
      option.fold(constVoid, flow(stateToIngredientInput, submit)),
    )

  return (
    <Form
      onSubmit={onSubmit}
      onCancel={props.onCancel}
      submitLabel={props.submitLabel}
      disabled={isDisabled || !isStateValid}
    >
      <TextField
        value={pipe(
          state.name,
          option.getOrElse(() => ''),
        )}
        onChange={e => dispatch(updateName(e.currentTarget.value))}
        label="Name"
        required
        disabled={isDisabled}
      />
      <PercentageField
        value={pipe(
          state.abv,
          option.getOrElse(() => 0),
        )}
        onChange={flow(updateAbv, dispatch)}
        label="ABV (%)"
        required
        disabled={isDisabled}
      />
      <PercentageField
        value={pipe(
          state.sugar,
          option.getOrElse(() => 0),
        )}
        onChange={flow(updateSugar, dispatch)}
        label="Sugar content (%)"
        required
        disabled={isDisabled}
      />
      <PercentageField
        value={pipe(
          state.acid,
          option.getOrElse(() => 0),
        )}
        onChange={flow(updateAcid, dispatch)}
        label="Total acidity (%)"
        required
        disabled={isDisabled}
      />
      <IngredientsForm
        ingredients={pipe(
          state.ingredients,
          option.getOrElse(() => [] as IngredientIngredient[]),
        )}
        onChange={onIngredientsChange}
        disabled={isDisabled}
      />
      <Divider />
      <RecipeForm
        steps={pipe(
          props.ingredient,
          option.map(({ recipe }) => recipe),
          option.chain(nonEmptyArray.fromArray),
          option.map(nonEmptyArray.map(({ step }) => step)),
        )}
        onChange={onRecipeChange}
      />
      {pipe(
        status,
        foldCommand(
          constNull,
          () => (
            <ErrorAlert message="An error has occurred while creating the ingredient. Please try again." />
          ),
          constNull,
        ),
      )}
    </Form>
  )
}
