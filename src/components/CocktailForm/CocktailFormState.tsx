import { nonEmptyArray, option } from 'fp-ts'
import { pipe } from 'fp-ts/function'
import { sequenceS } from 'fp-ts/Apply'
import { NonEmptyArray } from 'fp-ts/NonEmptyArray'
import { Option } from 'fp-ts/Option'
import { NonEmptyString } from 'io-ts-types'
import { Cocktail, CocktailIngredient, Technique } from '../../globalDomain'
import { CocktailInput } from '../../pages/CreateCocktail/domain'

export interface State {
  name: Option<NonEmptyString>
  technique: Option<Technique>
  ingredients: CocktailIngredient[]
  recipe: Option<NonEmptyArray<NonEmptyString>>
  garnish: Option<NonEmptyString>
}

interface ValidState {
  name: NonEmptyString
  technique: Technique
  ingredients: NonEmptyArray<CocktailIngredient>
  recipe: Option<NonEmptyArray<NonEmptyString>>
  garnish: Option<NonEmptyString>
}

export function validateState(state: State): Option<ValidState> {
  return pipe(
    {
      name: state.name,
      technique: state.technique,
      ingredients: pipe(state.ingredients, nonEmptyArray.fromArray),
    },
    sequenceS(option.Apply),
    option.map(options => ({
      ...options,
      recipe: state.recipe,
      garnish: state.garnish,
    })),
  )
}

export function stateFromCocktail(cocktail: Cocktail): State {
  return {
    name: pipe(cocktail.name, NonEmptyString.decode, option.fromEither),
    technique: option.some(cocktail.technique),
    ingredients: cocktail.ingredients,
    recipe: pipe(
      cocktail.recipe,
      nonEmptyArray.fromArray,
      option.map(nonEmptyArray.map(({ step }) => step)),
    ),
    garnish: cocktail.garnish,
  }
}

export function emptyState(): State {
  return {
    name: option.none,
    technique: option.none,
    ingredients: [],
    recipe: option.none,
    garnish: option.none,
  }
}

export function stateToCocktailInput(state: ValidState): CocktailInput {
  return {
    name: state.name,
    technique_code: state.technique.code,
    ingredients: state.ingredients.map(ingredient => ({
      id: ingredient.ingredient.id,
      amount: ingredient.amount,
      unit: ingredient.unit.unit,
      after_technique: ingredient.after_technique,
    })),
    recipe: state.recipe,
    garnish: state.garnish,
  }
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

interface UpdateTechniqueAction {
  type: 'UPDATE_TECHNIQUE'
  technique: Option<Technique>
}

export function updateTechnique(
  technique: Option<Technique>,
): UpdateTechniqueAction {
  return {
    type: 'UPDATE_TECHNIQUE',
    technique,
  }
}

interface UpdateIngredientsAction {
  type: 'UPDATE_INGREDIENTS'
  ingredients: CocktailIngredient[]
}

export function updateIngredients(
  ingredients: CocktailIngredient[],
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

interface UpdateGarnishAction {
  type: 'UPDATE_GARNISH'
  garnish: Option<NonEmptyString>
}

export function updateGarnish(
  garnish: Option<NonEmptyString>,
): UpdateGarnishAction {
  return { type: 'UPDATE_GARNISH', garnish }
}

type Action =
  | UpdateNameAction
  | UpdateTechniqueAction
  | UpdateIngredientsAction
  | UpdateRecipeAction
  | UpdateGarnishAction

export function reducer(state: State, action: Action): State {
  switch (action.type) {
    case 'UPDATE_NAME':
      return {
        ...state,
        name: pipe(NonEmptyString.decode(action.name), option.fromEither),
      }
    case 'UPDATE_TECHNIQUE':
      return {
        ...state,
        technique: action.technique,
      }
    case 'UPDATE_INGREDIENTS':
      return {
        ...state,
        ingredients: action.ingredients,
      }
    case 'UPDATE_RECIPE':
      return {
        ...state,
        recipe: action.recipe,
      }
    case 'UPDATE_GARNISH':
      return {
        ...state,
        garnish: action.garnish,
      }
    default:
      return state
  }
}
