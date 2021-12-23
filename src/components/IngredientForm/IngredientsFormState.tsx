import { pipe } from 'fp-ts/function'
import { sequenceS } from 'fp-ts/Apply'
import { Option } from 'fp-ts/Option'
import { Reader } from 'fp-ts/Reader'
import {
  NonNegative,
  NonNegativeInteger,
  IngredientWithoutIngredients,
  IngredientUnit,
  IngredientIngredient,
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
  ingredient: Option<IngredientWithoutIngredients>
  amount: Option<NonNegative>
  unit: Option<IngredientUnit>
}

function addingState(data: Omit<AddingState, 'type'>): AddingState {
  return {
    type: 'ADDING',
    ...data,
  }
}

interface EditingState {
  type: 'EDITING'
  originalIngredientIndex: NonNegativeInteger
  ingredient: Option<IngredientWithoutIngredients>
  amount: Option<NonNegative>
  unit: Option<IngredientUnit>
}

function editingState(data: Omit<EditingState, 'type'>): EditingState {
  return {
    type: 'EDITING',
    ...data,
  }
}

interface ValidAddingState {
  ingredient: IngredientWithoutIngredients
  amount: NonNegative
  unit: IngredientUnit
}

interface ValidEditingState extends ValidAddingState {
  originalIngredientIndex: NonNegativeInteger
}

export function validateState(state: AddingState): Option<ValidAddingState>
export function validateState(state: EditingState): Option<ValidEditingState>
export function validateState(
  state: AddingState | EditingState,
): Option<ValidAddingState | ValidEditingState> {
  return pipe(
    { ingredient: state.ingredient, amount: state.amount, unit: state.unit },
    sequenceS(option.Apply),
    option.map(validState =>
      state.type === 'ADDING'
        ? {
            ...validState,
          }
        : {
            ...validState,
            originalIngredientIndex: state.originalIngredientIndex,
          },
    ),
  )
}

export function stateToCocktailIngredient(
  state: ValidAddingState,
): IngredientIngredient {
  const ingredient = state.ingredient
  const amount = state.amount
  const unit = state.unit

  return {
    ingredient,
    amount,
    unit,
  }
}

function emptyIngredient(): Omit<AddingState, 'type'> {
  return {
    ingredient: option.none,
    amount: option.none,
    unit: option.none,
  }
}

export type State = ReadyState | AddingState | EditingState

export function foldState<T>(cases: {
  [k in State['type']]: Reader<Extract<State, { type: k }>, T>
}): Reader<State, T> {
  return state => cases[state.type](state as any)
}

interface OpenAction {
  type: 'OPEN'
}

export function openAction(): OpenAction {
  return { type: 'OPEN' }
}

interface SaveAction {
  type: 'SAVE'
}

export function saveAction(): SaveAction {
  return { type: 'SAVE' }
}

interface CloseAction {
  type: 'CLOSE'
}

export function close(): CloseAction {
  return { type: 'CLOSE' }
}

interface UpdateIngredientAction {
  type: 'UPDATE_INGREDIENT'
  ingredient: IngredientWithoutIngredients
}

export function updateIngredientAction(
  ingredient: IngredientWithoutIngredients,
): UpdateIngredientAction {
  return { type: 'UPDATE_INGREDIENT', ingredient }
}

interface UpdateAmountAction {
  type: 'UPDATE_AMOUNT'
  amount: NonNegative
}

export function updateAmountAction(amount: NonNegative): UpdateAmountAction {
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
  ingredient: IngredientIngredient
  originalIngredientIndex: NonNegativeInteger
}

export function importAction(
  ingredient: IngredientIngredient,
  originalIngredientIndex: NonNegativeInteger,
): ImportAction {
  return { type: 'IMPORT', ingredient, originalIngredientIndex }
}

type Action =
  | OpenAction
  | SaveAction
  | CloseAction
  | UpdateIngredientAction
  | UpdateAmountAction
  | UpdateUnitAction
  | ImportAction

export function reducer(state: State, action: Action): State {
  switch (state.type) {
    case 'READY':
      switch (action.type) {
        case 'OPEN':
          return addingState(emptyIngredient())
        case 'IMPORT':
          return editingState({
            originalIngredientIndex: action.originalIngredientIndex,
            ingredient: option.some(action.ingredient.ingredient),
            amount: option.some(action.ingredient.amount),
            unit: option.some(action.ingredient.unit),
          })
        case 'CLOSE':
        case 'SAVE':
        case 'UPDATE_INGREDIENT':
        case 'UPDATE_AMOUNT':
        case 'UPDATE_UNIT':
          return state
      }
    case 'ADDING':
      switch (action.type) {
        case 'OPEN':
          return state
        case 'CLOSE':
          return readyState()
        case 'SAVE':
          return pipe(
            validateState(state),
            option.fold(
              () => state,
              () => addingState(emptyIngredient()),
            ),
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
          return editingState({
            originalIngredientIndex: action.originalIngredientIndex,
            ingredient: option.some(action.ingredient.ingredient),
            amount: option.some(action.ingredient.amount),
            unit: option.some(action.ingredient.unit),
          })
      }
    case 'EDITING':
      switch (action.type) {
        case 'OPEN':
          return state
        case 'CLOSE':
          return readyState()
        case 'SAVE':
          return pipe(
            state,
            validateState,
            option.fold(
              () => state as State,
              () => addingState(emptyIngredient()),
            ),
          )
        case 'UPDATE_INGREDIENT':
          return editingState({
            ...state,
            ingredient: option.some(action.ingredient),
          })
        case 'UPDATE_AMOUNT':
          return editingState({
            ...state,
            amount: option.some(action.amount),
          })
        case 'UPDATE_UNIT':
          return editingState({
            ...state,
            unit: option.some(action.unit),
          })
        case 'IMPORT':
          return editingState({
            originalIngredientIndex: action.originalIngredientIndex,
            ingredient: option.some(action.ingredient.ingredient),
            amount: option.some(action.ingredient.amount),
            unit: option.some(action.ingredient.unit),
          })
      }
  }
}
