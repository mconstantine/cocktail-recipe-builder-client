import { nonEmptyArray, option } from 'fp-ts'
import { pipe } from 'fp-ts/function'
import { sequenceS } from 'fp-ts/Apply'
import { Option } from 'fp-ts/Option'
import { NonEmptyString } from 'io-ts-types'
import {
  Ingredient,
  IngredientIngredient,
  NonNegative,
  unsafeNonNegative,
} from '../../globalDomain'
import { NonEmptyArray } from 'fp-ts/NonEmptyArray'
import { IngredientInput } from '../../pages/CreateIngredient/domain'

export interface State {
  name: Option<NonEmptyString>
  abv: Option<NonNegative>
  sugar: Option<NonNegative>
  acid: Option<NonNegative>
  ingredients: Option<NonEmptyArray<IngredientIngredient>>
  recipe: Option<NonEmptyArray<NonEmptyString>>
}

export function emptyState(): State {
  return {
    name: option.none,
    abv: option.some(unsafeNonNegative(0)),
    sugar: option.some(unsafeNonNegative(0)),
    acid: option.some(unsafeNonNegative(0)),
    ingredients: option.none,
    recipe: option.none,
  }
}

export function ingredientToState(ingredient: Ingredient): State {
  const abvRange = ingredient.ranges.find(
    ({ unit: { name } }) => name === 'ABV',
  )
  const sugarRange = ingredient.ranges.find(
    ({ unit: { name } }) => name === 'Sugar',
  )
  const acidRange = ingredient.ranges.find(
    ({ unit: { name } }) => name === 'Acid',
  )

  return {
    name: option.some(ingredient.name),
    abv: option.some(abvRange?.amount ?? unsafeNonNegative(0)),
    sugar: option.some(sugarRange?.amount ?? unsafeNonNegative(0)),
    acid: option.some(acidRange?.amount ?? unsafeNonNegative(0)),
    ingredients: pipe(ingredient.ingredients, nonEmptyArray.fromArray),
    recipe: pipe(
      ingredient.recipe,
      option.map(nonEmptyArray.map(({ step }) => step)),
    ),
  }
}

export function stateToIngredientInput(state: ValidState): IngredientInput {
  return {
    ...state,
    ingredients: pipe(
      state.ingredients,
      option.map(
        nonEmptyArray.map(ingredient => ({
          ...ingredient,
          id: ingredient.ingredient.id,
          unit: ingredient.unit.unit,
        })),
      ),
    ),
  }
}

interface ValidState {
  name: NonEmptyString
  abv: NonNegative
  sugar: NonNegative
  acid: NonNegative
  ingredients: Option<NonEmptyArray<IngredientIngredient>>
  recipe: Option<NonEmptyArray<NonEmptyString>>
}

export function validateState(state: State): Option<ValidState> {
  const { name, abv, sugar, acid } = state

  return pipe(
    { name, abv, sugar, acid },
    sequenceS(option.Apply),
    option.map(options => ({
      ...options,
      ingredients: state.ingredients,
      recipe: state.recipe,
    })),
  )
}

interface UpdateNameAction {
  type: 'UPDATE_NAME'
  name: string
}

export function updateName(name: string): UpdateNameAction {
  return {
    type: 'UPDATE_NAME',
    name,
  }
}

interface UpdateAbvAction {
  type: 'UPDATE_ABV'
  abv: number
}

export function updateAbv(abv: number): UpdateAbvAction {
  return {
    type: 'UPDATE_ABV',
    abv,
  }
}

interface UpdateSugarAction {
  type: 'UPDATE_SUGAR'
  sugar: number
}

export function updateSugar(sugar: number): UpdateSugarAction {
  return {
    type: 'UPDATE_SUGAR',
    sugar,
  }
}

interface UpdateAcidAction {
  type: 'UPDATE_ACID'
  acid: number
}

export function updateAcid(acid: number): UpdateAcidAction {
  return {
    type: 'UPDATE_ACID',
    acid,
  }
}

interface UpdateIngredientsAction {
  type: 'UPDATE_INGREDIENTS'
  ingredients: IngredientIngredient[]
}

export function updateIngredients(
  ingredients: IngredientIngredient[],
): UpdateIngredientsAction {
  return {
    type: 'UPDATE_INGREDIENTS',
    ingredients,
  }
}

interface UpdateRecipeAction {
  type: 'UPDATE_RECIPE'
  recipe: Option<NonEmptyArray<NonEmptyString>>
}

export function updateRecipe(
  recipe: Option<NonEmptyArray<NonEmptyString>>,
): UpdateRecipeAction {
  return { type: 'UPDATE_RECIPE', recipe }
}

type Action =
  | UpdateNameAction
  | UpdateAbvAction
  | UpdateSugarAction
  | UpdateAcidAction
  | UpdateIngredientsAction
  | UpdateRecipeAction

export function reducer(state: State, action: Action): State {
  switch (action.type) {
    case 'UPDATE_NAME':
      return {
        ...state,
        name: pipe(action.name, NonEmptyString.decode, option.fromEither),
      }
    case 'UPDATE_ABV':
      return {
        ...state,
        abv: pipe(action.abv, NonNegative.decode, option.fromEither),
      }
    case 'UPDATE_SUGAR':
      return {
        ...state,
        sugar: pipe(action.sugar, NonNegative.decode, option.fromEither),
      }
    case 'UPDATE_ACID':
      return {
        ...state,
        acid: pipe(action.acid, NonNegative.decode, option.fromEither),
      }
    case 'UPDATE_INGREDIENTS':
      return {
        ...state,
        ingredients: pipe(action.ingredients, nonEmptyArray.fromArray),
      }
    case 'UPDATE_RECIPE':
      return {
        ...state,
        recipe: action.recipe,
      }
  }
}
