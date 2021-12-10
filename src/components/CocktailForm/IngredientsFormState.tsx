import { pipe } from 'fp-ts/function'
import { sequenceS } from 'fp-ts/Apply'
import { Option } from 'fp-ts/Option'
import { Reader } from 'fp-ts/Reader'
import {
  CocktailIngredient,
  Ingredient,
  IngredientUnit,
} from '../../globalDomain'
import { option } from 'fp-ts'

interface ReadyState {
  type: 'READY'
}

function readyState(): ReadyState {
  return { type: 'READY' }
}

interface AddingState {
  type: 'ADDING'
  ingredient: Option<Ingredient>
  amount: Option<number>
  unit: Option<IngredientUnit>
}

interface ValidState {
  ingredient: Ingredient
  amount: number
  unit: IngredientUnit
}

function addingState(data: Omit<AddingState, 'type'>): AddingState {
  return {
    type: 'ADDING',
    ...data,
  }
}

export function validateState(state: AddingState): Option<ValidState> {
  return pipe(
    { ingredient: state.ingredient, amount: state.amount, unit: state.unit },
    sequenceS(option.Apply),
  )
}

export function stateToCocktailIngredient(
  state: ValidState,
): CocktailIngredient {
  const ingredient = state.ingredient
  const amount = state.amount
  const unit = state.unit

  return {
    ingredient,
    amount,
    unit,
  }
}

function emptyIngredient(): AddingState {
  return {
    type: 'ADDING',
    ingredient: option.none,
    amount: option.none,
    unit: option.none,
  }
}

export type State = ReadyState | AddingState

export function foldState<T>(cases: {
  [k in State['type']]: Reader<Extract<State, { type: k }>, T>
}): Reader<State, T> {
  return state => cases[state.type](state as any)
}

interface StartAction {
  type: 'START'
}

export function startAction(): StartAction {
  return { type: 'START' }
}

interface SaveAction {
  type: 'SAVE'
}

export function saveAction(): SaveAction {
  return { type: 'SAVE' }
}

interface CancelAction {
  type: 'CANCEL'
}

export function cancelAction(): CancelAction {
  return { type: 'CANCEL' }
}

interface UpdateIngredientAction {
  type: 'UPDATE_INGREDIENT'
  ingredient: Ingredient
}

export function updateIngredientAction(
  ingredient: Ingredient,
): UpdateIngredientAction {
  return { type: 'UPDATE_INGREDIENT', ingredient }
}

interface UpdateAmountAction {
  type: 'UPDATE_AMOUNT'
  amount: number
}

export function updateAmountAction(amount: number): UpdateAmountAction {
  return { type: 'UPDATE_AMOUNT', amount }
}

interface UpdateUnitAction {
  type: 'UPDATE_UNIT'
  unit: IngredientUnit
}

export function updateUnitAction(unit: IngredientUnit): UpdateUnitAction {
  return { type: 'UPDATE_UNIT', unit }
}

interface ImportAction {
  type: 'IMPORT'
  ingredient: CocktailIngredient
}

export function importAction(ingredient: CocktailIngredient): ImportAction {
  return { type: 'IMPORT', ingredient }
}

type Action =
  | StartAction
  | SaveAction
  | CancelAction
  | UpdateIngredientAction
  | UpdateAmountAction
  | UpdateUnitAction
  | ImportAction

export function reducer(state: State, action: Action): State {
  switch (state.type) {
    case 'READY':
      switch (action.type) {
        case 'START':
          return emptyIngredient()
        case 'IMPORT':
          return addingState({
            ingredient: option.some(action.ingredient.ingredient),
            amount: option.some(action.ingredient.amount),
            unit: option.some(action.ingredient.unit),
          })
        case 'CANCEL':
        case 'SAVE':
        case 'UPDATE_INGREDIENT':
        case 'UPDATE_AMOUNT':
        case 'UPDATE_UNIT':
          return state
      }
    case 'ADDING':
      switch (action.type) {
        case 'START':
          return state
        case 'CANCEL':
          return readyState()
        case 'SAVE':
          return pipe(
            state,
            validateState,
            option.fold(() => state, emptyIngredient),
          )
        case 'UPDATE_INGREDIENT':
          return addingState({
            ...state,
            ingredient: option.some(action.ingredient),
          })
        case 'UPDATE_AMOUNT':
          return addingState({
            ...state,
            amount: option.some(action.amount),
          })
        case 'UPDATE_UNIT':
          return addingState({
            ...state,
            unit: option.some(action.unit),
          })
        case 'IMPORT':
          return addingState({
            ingredient: option.some(action.ingredient.ingredient),
            amount: option.some(action.ingredient.amount),
            unit: option.some(action.ingredient.unit),
          })
      }
  }
}
