import { IO } from 'fp-ts/IO'
import { constFalse, constNull, constTrue, pipe } from 'fp-ts/function'
import { Option } from 'fp-ts/Option'
import { useReducer } from 'react'
import { CommandHookOutput, foldCommand, useGet } from '../../api/useApi'
import { Cocktail, CocktailIngredient } from '../../pages/Cocktail/domain'
import { Form } from '../Form'
import { option } from 'fp-ts'
import { CocktailInput } from '../../pages/CreateCocktail/domain'
import { Autocomplete, Divider, TextField } from '@mui/material'
import { getTechniques, getUnits } from '../../pages/CreateCocktail/api'
import { sequenceS } from 'fp-ts/Apply'
import { query, Technique } from '../../globalDomain'
import { IngredientsForm } from './IngredientsForm'
import {
  emptyState,
  isStateValid,
  reducer,
  stateToCocktailInput,
  updateIngredients,
  updateName,
  updateTechnique,
} from './CocktailFormState'

interface Props {
  cocktail: Option<Cocktail>
  command: CommandHookOutput<CocktailInput>
  onCancel: IO<unknown>
  submitLabel: string
}

export function CocktailForm(props: Props) {
  const [status, submit] = props.command
  const [techniques] = useGet(getTechniques)
  const [units] = useGet(getUnits)
  const [state, dispatch] = useReducer(reducer, emptyState())

  const onNameChange = (name: string) => dispatch(updateName(name))

  const onTechniqueChange = (technique: Option<Technique>) =>
    dispatch(updateTechnique(technique))

  const onIngredientsChange = (ingredients: CocktailIngredient[]) =>
    dispatch(updateIngredients(ingredients))

  const onSubmit = () => {
    if (!isStateValid(state)) {
      return
    }

    submit(stateToCocktailInput(state))
  }

  const isFormDisabled = pipe(
    status,
    foldCommand(constTrue, constFalse, constFalse),
  )

  return pipe(
    sequenceS(query.Apply)({ techniques, units }),
    query.map(({ techniques }) => (
      <Form
        onSubmit={onSubmit}
        onCancel={props.onCancel}
        submitLabel={props.submitLabel}
        disabled={isFormDisabled || !isStateValid(state)}
      >
        <TextField
          value={pipe(
            state.name,
            option.getOrElse(() => ''),
          )}
          onChange={e => onNameChange(e.currentTarget.value)}
          label="Name"
          required
          disabled={isFormDisabled}
        />
        <Autocomplete
          options={techniques}
          getOptionLabel={({ name }) => name}
          renderInput={params => <TextField {...params} label="Technique" />}
          value={pipe(
            state.technique,
            option.getOrElse<Technique | null>(constNull),
          )}
          onChange={(_, value) => onTechniqueChange(option.fromNullable(value))}
        />
        <IngredientsForm
          ingredients={state.ingredients}
          onChange={onIngredientsChange}
          disabled={isFormDisabled}
        />
        <Divider />
      </Form>
    )),
    query.getOrElse<Error, JSX.Element | null>(constNull),
  )
}
