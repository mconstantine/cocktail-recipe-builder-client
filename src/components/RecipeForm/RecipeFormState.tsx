import { array, eq, nonEmptyArray, number, option, string } from 'fp-ts'
import { constTrue, flow, pipe } from 'fp-ts/function'
import { Reader } from 'fp-ts/Reader'
import { NonEmptyArray } from 'fp-ts/NonEmptyArray'
import { Option } from 'fp-ts/Option'
import { NonEmptyString } from 'io-ts-types'
import { Eq } from 'fp-ts/Eq'

export type Steps = Option<NonEmptyArray<NonEmptyString>>

const eqSteps: Eq<Steps> = option.getEq(nonEmptyArray.getEq(string.Eq))

interface DefaultState {
  type: 'DEFAULT'
  steps: Steps
}

const eqDefaultState: Eq<DefaultState> = eq.struct({
  type: eq.fromEquals(constTrue),
  steps: eqSteps,
})

function defaultState(steps: Steps = option.none): DefaultState {
  return { type: 'DEFAULT', steps }
}

export function stateFromSteps(steps: Steps): DefaultState {
  return defaultState(steps)
}

interface AddingState {
  type: 'ADDING'
  steps: Steps
  currentStep: string
}

const eqAddingState: Eq<AddingState> = eq.struct({
  type: eq.fromEquals(constTrue),
  steps: eqSteps,
  currentStep: string.Eq,
})

function addingState(steps: Steps, currentStep: string): AddingState {
  return { type: 'ADDING', steps, currentStep }
}

interface EditingState {
  type: 'EDITING'
  steps: Steps
  currentStep: string
  currentStepIndex: number
}

const eqEditingState: Eq<EditingState> = eq.struct({
  type: eq.fromEquals(constTrue),
  steps: eqSteps,
  currentStep: string.Eq,
  currentStepIndex: number.Eq,
})

function editingState(
  steps: Steps,
  currentStep: string,
  currentStepIndex: number,
): EditingState {
  return { type: 'EDITING', steps, currentStep, currentStepIndex }
}

type State = DefaultState | AddingState | EditingState

export const eqState: Eq<State> = eq.fromEquals((x, y) =>
  pipe(
    x,
    foldState({
      DEFAULT: x => y.type === 'DEFAULT' && eqDefaultState.equals(x, y),
      ADDING: x => y.type === 'ADDING' && eqAddingState.equals(x, y),
      EDITING: x => y.type === 'EDITING' && eqEditingState.equals(x, y),
    }),
  ),
)

export function foldState<T>(cases: {
  [k in State['type']]: Reader<Extract<State, { type: k }>, T>
}): Reader<State, T> {
  return state => cases[state.type](state as any)
}

interface NewStepAction {
  type: 'NEW_STEP'
}

export function newStep(): NewStepAction {
  return { type: 'NEW_STEP' }
}

interface AddStepAction {
  type: 'ADD_STEP'
  step: NonEmptyString
}

export function addStep(step: NonEmptyString): AddStepAction {
  return { type: 'ADD_STEP', step }
}

interface EditStepAction {
  type: 'EDIT_STEP'
  stepIndex: number
}

export function editStep(stepIndex: number): EditStepAction {
  return { type: 'EDIT_STEP', stepIndex }
}

interface SaveStepAction {
  type: 'SAVE_STEP'
  step: NonEmptyString
}

export function saveStep(step: NonEmptyString): SaveStepAction {
  return { type: 'SAVE_STEP', step }
}

interface UpdateStepInputAction {
  type: 'STEP_INPUT'
  input: string
}

export function updateStepInput(input: string): UpdateStepInputAction {
  return { type: 'STEP_INPUT', input }
}

interface CancelAction {
  type: 'CANCEL'
}

export function cancel(): CancelAction {
  return { type: 'CANCEL' }
}

interface DeleteStepAction {
  type: 'DELETE_STEP'
  stepIndex: number
}

export function deleteStep(stepIndex: number): DeleteStepAction {
  return { type: 'DELETE_STEP', stepIndex }
}

interface MoveUpAction {
  type: 'MOVE_UP'
  stepIndex: number
}

export function moveUp(stepIndex: number): MoveUpAction {
  return { type: 'MOVE_UP', stepIndex }
}

type Action =
  | NewStepAction
  | AddStepAction
  | EditStepAction
  | SaveStepAction
  | UpdateStepInputAction
  | CancelAction
  | DeleteStepAction
  | MoveUpAction

export function reducer(state: State, action: Action): State {
  switch (state.type) {
    case 'DEFAULT':
      switch (action.type) {
        case 'NEW_STEP':
          return addingState(state.steps, '')
        case 'EDIT_STEP':
          return editingState(
            state.steps,
            pipe(
              state.steps,
              option.map(steps => steps[action.stepIndex] || ''),
              option.getOrElse(() => ''),
            ),
            action.stepIndex,
          )
        case 'DELETE_STEP':
          return defaultState(
            pipe(
              state.steps,
              option.chain(
                flow(
                  array.filterWithIndex(index => index !== action.stepIndex),
                  nonEmptyArray.fromArray,
                ),
              ),
            ),
          )
        case 'MOVE_UP':
          if (action.stepIndex === 0) {
            return state
          }

          return defaultState(
            pipe(
              state.steps,
              option.map(
                steps =>
                  [
                    ...steps.slice(0, action.stepIndex - 1),
                    steps[action.stepIndex],
                    steps[action.stepIndex - 1],
                    ...steps.slice(action.stepIndex + 1),
                  ] as NonEmptyArray<NonEmptyString>,
              ),
            ),
          )
        case 'ADD_STEP':
        case 'SAVE_STEP':
        case 'STEP_INPUT':
        case 'CANCEL':
          return state
      }
    case 'ADDING':
      switch (action.type) {
        case 'STEP_INPUT':
          return addingState(state.steps, action.input)
        case 'ADD_STEP':
          return defaultState(
            pipe(
              [
                ...pipe(
                  state.steps,
                  option.getOrElse(() => [] as NonEmptyString[]),
                ),
                action.step,
              ],
              nonEmptyArray.fromArray,
            ),
          )
        case 'CANCEL':
          return defaultState(state.steps)
        case 'NEW_STEP':
        case 'EDIT_STEP':
        case 'SAVE_STEP':
        case 'DELETE_STEP':
        case 'MOVE_UP':
          return state
      }
    case 'EDITING':
      switch (action.type) {
        case 'STEP_INPUT':
          return editingState(state.steps, action.input, state.currentStepIndex)
        case 'SAVE_STEP':
          return defaultState(
            pipe(
              state.steps,
              option.map(
                nonEmptyArray.mapWithIndex((index, step) =>
                  index === state.currentStepIndex ? action.step : step,
                ),
              ),
            ),
          )
        case 'CANCEL':
          return defaultState(state.steps)
        case 'NEW_STEP':
        case 'ADD_STEP':
        case 'EDIT_STEP':
        case 'DELETE_STEP':
        case 'MOVE_UP':
          return state
      }
  }
}
