import { pipe } from 'fp-ts/function'
import { sequenceS } from 'fp-ts/Apply'
import { Option, Some } from 'fp-ts/Option'
import { Reader } from 'fp-ts/Reader'
import { Unit } from '../../globalDomain'
import { boolean, option } from 'fp-ts'
import { Ingredient } from '../../pages/Ingredient/domain'
import { CocktailIngredient } from '../../pages/Cocktail/domain'

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
  unit: Option<Unit>
}

interface ValidState extends AddingState {
  ingredient: Some<Ingredient>
  amount: Some<number>
  unit: Some<Unit>
}

function addingState(data: Omit<AddingState, 'type'>): AddingState {
  return {
    type: 'ADDING',
    ...data,
  }
}

export function isStateValid(state: AddingState): state is ValidState {
  return pipe(
    { i: state.ingredient, a: state.amount, u: state.unit },
    sequenceS(option.Apply),
    option.isSome,
  )
}

export function stateToCocktailIngredient(
  state: ValidState,
): CocktailIngredient {
  const ingredient = state.ingredient.value
  const amount = state.amount.value
  const unit = state.unit.value

  return {
    id: ingredient.id,
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
  unit: Unit
}

export function updateUnitAction(unit: Unit): UpdateUnitAction {
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
            isStateValid,
            boolean.fold<State>(() => state, emptyIngredient),
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
