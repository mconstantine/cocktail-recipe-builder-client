import { option } from 'fp-ts'
import { pipe } from 'fp-ts/function'
import { sequenceS } from 'fp-ts/Apply'
import { Option } from 'fp-ts/Option'
import { NonEmptyString } from 'io-ts-types'
import { Ingredient, NonNegative, unsafeNonNegative } from '../../globalDomain'

export interface State {
  name: Option<NonEmptyString>
  abv: Option<NonNegative>
  sugar: Option<NonNegative>
  acid: Option<NonNegative>
}

export function emptyState(): State {
  return {
    name: option.none,
    abv: option.some(unsafeNonNegative(0)),
    sugar: option.some(unsafeNonNegative(0)),
    acid: option.some(unsafeNonNegative(0)),
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
  }
}

interface ValidState {
  name: NonEmptyString
  abv: NonNegative
  sugar: NonNegative
  acid: NonNegative
}

export function validateState(state: State): Option<ValidState> {
  const { name, abv, sugar, acid } = state
  return pipe({ name, abv, sugar, acid }, sequenceS(option.Apply))
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

type Action =
  | UpdateNameAction
  | UpdateAbvAction
  | UpdateSugarAction
  | UpdateAcidAction

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
    default:
      return state
  }
}
