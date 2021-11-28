import { TextField, TextFieldProps } from '@mui/material'
import { Reader } from 'fp-ts/Reader'

interface Props extends Omit<TextFieldProps, 'value' | 'onChange' | 'type'> {
  value: number
  onChange: Reader<number, void>
}

function normalizePercentage(input: string): number {
  const value = parseFloat(input)

  if (Number.isNaN(value)) {
    return 0
  }

  return Math.min(Math.max(value, 0), 100)
}

export function PercentageField(props: Props) {
  return (
    <TextField
      {...props}
      type="number"
      value={props.value.toString()}
      onChange={e => props.onChange(normalizePercentage(e.currentTarget.value))}
    />
  )
}
