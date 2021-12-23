import { TextField } from '@mui/material'
import { option } from 'fp-ts'
import {
  constFalse,
  constNull,
  constTrue,
  constVoid,
  flow,
  pipe,
} from 'fp-ts/function'
import { Option } from 'fp-ts/Option'
import { useReducer } from 'react'
import { IngredientInput } from '../../pages/CreateIngredient/domain'
import { Form } from '../Form'
import { PercentageField } from '../PercentageField'
import { CommandHookOutput, foldCommand } from '../../api/useApi'
import { ErrorAlert } from '../ErrorAlert'
import { IO } from 'fp-ts/IO'
import { Ingredient } from '../../globalDomain'
import {
  emptyState,
  ingredientToState,
  reducer,
  updateAbv,
  updateAcid,
  updateName,
  updateSugar,
  validateState,
} from './IngredientFormState'

interface Props {
  ingredient: Option<Ingredient>
  command: CommandHookOutput<IngredientInput>
  onCancel: IO<unknown>
  submitLabel: string
}

export function IngredientForm(props: Props) {
  const [status, submit] = props.command

  const [state, dispatch] = useReducer(
    reducer,
    pipe(
      props.ingredient,
      option.fold(() => emptyState(), ingredientToState),
    ),
  )

  const isStateValid = option.isSome(validateState(state))

  const isDisabled = pipe(
    status,
    foldCommand(constTrue, constFalse, constFalse),
  )

  const onSubmit = () =>
    pipe(state, validateState, option.fold(constVoid, submit))

  return (
    <Form
      onSubmit={onSubmit}
      onCancel={props.onCancel}
      submitLabel={props.submitLabel}
      disabled={isDisabled || !isStateValid}
    >
      <TextField
        value={pipe(
          state.name,
          option.getOrElse(() => ''),
        )}
        onChange={e => dispatch(updateName(e.currentTarget.value))}
        label="Name"
        required
        disabled={isDisabled}
      />
      <PercentageField
        value={pipe(
          state.abv,
          option.getOrElse(() => 0),
        )}
        onChange={flow(updateAbv, dispatch)}
        label="ABV (%)"
        required
        disabled={isDisabled}
      />
      <PercentageField
        value={pipe(
          state.sugar,
          option.getOrElse(() => 0),
        )}
        onChange={flow(updateSugar, dispatch)}
        label="Sugar content (%)"
        required
        disabled={isDisabled}
      />
      <PercentageField
        value={pipe(
          state.acid,
          option.getOrElse(() => 0),
        )}
        onChange={flow(updateAcid, dispatch)}
        label="Total acidity (%)"
        required
        disabled={isDisabled}
      />
      {pipe(
        status,
        foldCommand(
          constNull,
          () => (
            <ErrorAlert message="An error has occurred while creating the ingredient. Please try again." />
          ),
          constNull,
        ),
      )}
    </Form>
  )
}
