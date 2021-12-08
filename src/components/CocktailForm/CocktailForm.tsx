import { IO } from 'fp-ts/IO'
import { constFalse, constNull, constTrue, pipe } from 'fp-ts/function'
import { Option } from 'fp-ts/Option'
import { useState } from 'react'
import { CommandHookOutput, foldCommand, useGet } from '../../api/useApi'
import { Cocktail } from '../../pages/Cocktail/domain'
import { Form } from '../Form'
import { option } from 'fp-ts'
import { CocktailInput } from '../../pages/CreateCocktail/domain'
import { Autocomplete, TextField } from '@mui/material'
import { getTechniques, getUnits } from '../../pages/CreateCocktail/api'
import { sequenceS } from 'fp-ts/Apply'
import { query, Technique, TechniqueCode } from '../../globalDomain'
import { IngredientsForm } from './IngredientsForm'

interface Props {
  cocktail: Option<Cocktail>
  command: CommandHookOutput<CocktailInput>
  onCancel: IO<unknown>
  submitLabel: string
}

function getTechnique(code: TechniqueCode, techniques: Technique[]) {
  return techniques.find(t => t.code === code)
}

export function CocktailForm(props: Props) {
  const [status, submit] = props.command
  const [techniques] = useGet(getTechniques)
  const [units] = useGet(getUnits)

  const [input, setInput] = useState<CocktailInput>(
    pipe(
      props.cocktail,
      option.map(cocktail => ({
        name: cocktail.name,
        technique_code: cocktail.technique.code,
        ingredients: cocktail.ingredients.map(ingredient => ({
          id: ingredient.id,
          amount: ingredient.amount,
          unit: ingredient.unit.unit,
        })),
      })),
      option.getOrElse(
        (): CocktailInput => ({
          name: '',
          technique_code: 'BUILT',
          ingredients: [],
        }),
      ),
    ),
  )

  const onNameChange = (name: string) => setInput(input => ({ ...input, name }))
  const onTechniqueChange = (technique: Technique) =>
    setInput(input => ({ ...input, technique_code: technique.code }))

  const isDisabled = pipe(
    status,
    foldCommand(constTrue, constFalse, constFalse),
  )

  return pipe(
    sequenceS(query.query)({ techniques, units }),
    query.map(({ techniques }) => (
      <Form
        onSubmit={() => submit(input)}
        onCancel={props.onCancel}
        submitLabel={props.submitLabel}
      >
        <TextField
          value={input.name}
          onChange={e => onNameChange(e.currentTarget.value)}
          label="Name"
          required
          disabled={isDisabled}
        />
        <Autocomplete
          options={techniques}
          getOptionLabel={({ name }) => name}
          renderInput={params => <TextField {...params} label="Technique" />}
          value={getTechnique(input.technique_code, techniques)}
          onChange={(_, value) => value && onTechniqueChange(value)}
        />
        <IngredientsForm
          ingredients={input.ingredients}
          onChange={console.log}
        />
      </Form>
    )),
    query.getOrElse<Error, JSX.Element | null>(constNull),
  )
}
