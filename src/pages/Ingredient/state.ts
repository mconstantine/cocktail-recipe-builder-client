import { Reader } from 'fp-ts/Reader'

interface ShowingState {
  type: 'Showing'
}

interface EditingState {
  type: 'Editing'
}

interface DeletingState {
  type: 'Deleting'
  error: boolean
}

export type State = ShowingState | EditingState | DeletingState

export function showingState(): ShowingState {
  return { type: 'Showing' }
}

export function editingState(): EditingState {
  return { type: 'Editing' }
}

export function deletingState(error: boolean): DeletingState {
  return { type: 'Deleting', error }
}

export function foldState<T>(cases: {
  [k in State['type']]: Reader<Extract<State, { type: k }>, T>
}): Reader<State, T> {
  return state => cases[state.type](state as any)
}
