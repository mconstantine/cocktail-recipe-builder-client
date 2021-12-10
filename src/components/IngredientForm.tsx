import { TextField } from '@mui/material'
import { option } from 'fp-ts'
import { constFalse, constNull, constTrue, pipe } from 'fp-ts/function'
import { Option } from 'fp-ts/Option'
import { useState } from 'react'
import { IngredientInput } from '../pages/CreateIngredient/domain'
import { Form } from './Form'
import { PercentageField } from './PercentageField'
import { CommandHookOutput, foldCommand } from '../api/useApi'
import { ErrorAlert } from './ErrorAlert'
import { IO } from 'fp-ts/IO'
import { Ingredient } from '../globalDomain'

interface Props {
  ingredient: Option<Ingredient>
  command: CommandHookOutput<IngredientInput>
  onCancel: IO<unknown>
  submitLabel: string
}

function ingredientToInput(ingredient: Ingredient): IngredientInput {
  const abvRange = ingredient.ranges.find(
    ({ unit: { name } }) => name === 'ABV',
  )
  const sugarRange = ingredient.ranges.find(
    ({ unit: { name } }) => name === 'Sugar',
  )
  const acidRange = ingredient.ranges.find(
    ({ unit: { name } }) => name === 'Acid',
  )

  return {
    name: ingredient.name,
    abv: abvRange?.amount ?? 0,
    sugar: sugarRange?.amount ?? 0,
    acid: acidRange?.amount ?? 0,
  }
}

export function IngredientForm(props: Props) {
  const [status, submit] = props.command

  const [input, setInput] = useState<IngredientInput>(
    pipe(
      props.ingredient,
      option.map(ingredientToInput),
      option.getOrElse(() => ({ name: '', abv: 0, sugar: 0, acid: 0 })),
    ),
  )

  const onNameChange = (name: string) => setInput(data => ({ ...data, name }))
  const onAbvChange = (abv: number) => setInput(data => ({ ...data, abv }))

  const onSugarChange = (sugar: number) =>
    setInput(data => ({ ...data, sugar }))

  const onAcidChange = (acid: number) => setInput(data => ({ ...data, acid }))

  const isDisabled = pipe(
    status,
    foldCommand(constTrue, constFalse, constFalse),
  )

  return (
    <Form
      onSubmit={() => submit(input)}
      onCancel={props.onCancel}
      submitLabel={props.submitLabel}
      disabled={isDisabled}
    >
      <TextField
        value={input.name}
        onChange={e => onNameChange(e.currentTarget.value)}
        label="Name"
        required
        disabled={isDisabled}
      />
      <PercentageField
        value={input.abv}
        onChange={onAbvChange}
        label="ABV (%)"
        required
        disabled={isDisabled}
      />
      <PercentageField
        value={input.sugar}
        onChange={onSugarChange}
        label="Sugar content (%)"
        required
        disabled={isDisabled}
      />
      <PercentageField
        value={input.acid}
        onChange={onAcidChange}
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
