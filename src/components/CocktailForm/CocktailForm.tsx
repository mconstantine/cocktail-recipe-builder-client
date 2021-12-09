import { IO } from 'fp-ts/IO'
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
  reducer,
  stateFromCocktail,
  stateToCocktailInput,
  updateIngredients,
  updateName,
  updateTechnique,
  validateState,
} from './CocktailFormState'
import { getCocktailProfile } from '../../utils/getCocktailProfile'
import { CocktailProfileList } from '../CocktailProfileList'
import { ProfileGraph } from '../ProfileGraph/ProfileGraph'

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

  const [state, dispatch] = useReducer(
    reducer,
    pipe(
      props.cocktail,
      option.map(stateFromCocktail),
      option.getOrElse(emptyState),
    ),
  )

  const validState = validateState(state)
  const isStateValid = option.isSome(validState)
  const profile = pipe(validState, option.map(getCocktailProfile))

  const onNameChange = (name: string) => dispatch(updateName(name))

  const onTechniqueChange = (technique: Option<Technique>) =>
    dispatch(updateTechnique(technique))

  const onIngredientsChange = (ingredients: CocktailIngredient[]) =>
    dispatch(updateIngredients(ingredients))

  const onSubmit = () => {
    pipe(validState, option.fold(constVoid, flow(stateToCocktailInput, submit)))
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
        disabled={isFormDisabled || !isStateValid}
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
        {pipe(
          { technique: state.technique, profile },
          sequenceS(option.Apply),
          option.fold(constNull, ({ profile, technique }) => (
            <>
              <ProfileGraph profile={profile} technique={technique} />
              <CocktailProfileList profile={profile} technique={technique} />
            </>
          )),
        )}
      </Form>
    )),
    query.getOrElse<Error, JSX.Element | null>(constNull),
  )
}
