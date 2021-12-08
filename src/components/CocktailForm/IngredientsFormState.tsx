import { pipe } from 'fp-ts/function'
import { sequenceS } from 'fp-ts/Apply'
import { Option } from 'fp-ts/Option'
import { Reader } from 'fp-ts/Reader'
import { Unit } from '../../globalDomain'
import { IngredientIndexOutput } from '../../pages/Ingredients/domain'
import { boolean, option } from 'fp-ts'

interface ReadyState {
  type: 'READY'
}

function readyState(): ReadyState {
  return { type: 'READY' }
}

interface AddingState {
  type: 'ADDING'
  ingredient: Option<IngredientIndexOutput>
  amount: Option<number>
  unit: Option<Unit>
}

function addingState(data: Omit<AddingState, 'type'>): AddingState {
  return {
    type: 'ADDING',
    ...data,
  }
}

export function isStateValid(state: AddingState): boolean {
  return pipe(
    { i: state.ingredient, a: state.amount, u: state.unit },
    sequenceS(option.option),
    option.isSome,
  )
}

function emptyIngredient(): Omit<AddingState, 'type'> {
  return {
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

interface UpdateIngredientAction {
  type: 'UPDATE_INGREDIENT'
  ingredient: IngredientIndexOutput
}

export function updateIngredientAction(
  ingredient: IngredientIndexOutput,
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

type Action =
  | StartAction
  | SaveAction
  | UpdateIngredientAction
  | UpdateAmountAction
  | UpdateUnitAction

export function reducer(state: State, action: Action): State {
  switch (state.type) {
    case 'READY':
      switch (action.type) {
        case 'START':
          return addingState(emptyIngredient())
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
        case 'SAVE':
          return pipe(
            state,
            isStateValid,
            boolean.fold<State>(() => state, readyState),
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
      }
  }
}
