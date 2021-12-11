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
  after_technique: boolean
}

function addingState(data: Omit<AddingState, 'type'>): AddingState {
  return {
    type: 'ADDING',
    ...data,
  }
}

interface EditingState {
  type: 'EDITING'
  originalIngredientIndex: number
  ingredient: Option<Ingredient>
  amount: Option<number>
  unit: Option<IngredientUnit>
  after_technique: boolean
}

function editingState(data: Omit<EditingState, 'type'>): EditingState {
  return {
    type: 'EDITING',
    ...data,
  }
}

interface ValidAddingState {
  ingredient: Ingredient
  amount: number
  unit: IngredientUnit
  after_technique: boolean
}

interface ValidEditingState extends ValidAddingState {
  originalIngredientIndex: number
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
            after_technique: state.after_technique,
          }
        : {
            ...validState,
            originalIngredientIndex: state.originalIngredientIndex,
            after_technique: state.after_technique,
          },
    ),
  )
}

export function stateToCocktailIngredient(
  state: ValidAddingState,
): CocktailIngredient {
  const ingredient = state.ingredient
  const amount = state.amount
  const unit = state.unit
  const after_technique = state.after_technique

  return {
    ingredient,
    amount,
    unit,
    after_technique,
  }
}

function emptyIngredient(): Omit<AddingState, 'type'> {
  return {
    ingredient: option.none,
    amount: option.none,
    unit: option.none,
    after_technique: false,
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

interface UpdateAfterTechniqueAction {
  type: 'UPDATE_AFTER_TECHNIQUE'
  after_technique: boolean
}

export function updateAfterTechniqueAction(
  after_technique: boolean,
): UpdateAfterTechniqueAction {
  return { type: 'UPDATE_AFTER_TECHNIQUE', after_technique }
}

interface ImportAction {
  type: 'IMPORT'
  ingredient: CocktailIngredient
  originalIngredientIndex: number
}

export function importAction(
  ingredient: CocktailIngredient,
  originalIngredientIndex: number,
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
  | UpdateAfterTechniqueAction
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
            after_technique: action.ingredient.after_technique,
          })
        case 'CLOSE':
        case 'SAVE':
        case 'UPDATE_INGREDIENT':
        case 'UPDATE_AMOUNT':
        case 'UPDATE_UNIT':
        case 'UPDATE_AFTER_TECHNIQUE':
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
        case 'UPDATE_AFTER_TECHNIQUE':
          return addingState({
            ...state,
            after_technique: action.after_technique,
          })
        case 'IMPORT':
          return editingState({
            originalIngredientIndex: action.originalIngredientIndex,
            ingredient: option.some(action.ingredient.ingredient),
            amount: option.some(action.ingredient.amount),
            unit: option.some(action.ingredient.unit),
            after_technique: action.ingredient.after_technique,
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
        case 'UPDATE_AFTER_TECHNIQUE':
          return editingState({
            ...state,
            after_technique: action.after_technique,
          })
        case 'IMPORT':
          return editingState({
            originalIngredientIndex: action.originalIngredientIndex,
            ingredient: option.some(action.ingredient.ingredient),
            amount: option.some(action.ingredient.amount),
            unit: option.some(action.ingredient.unit),
            after_technique: action.ingredient.after_technique,
          })
      }
  }
}
