import { TextField, TextFieldProps } from '@mui/material'
import { Reader } from 'fp-ts/Reader'

interface Props extends Omit<TextFieldProps, 'value' | 'onChange' | 'type'> {
  min?: number
  max?: number
  value: number
  onChange: Reader<number, void>
}

function normalizeNumber(value: string, min?: number, max?: number): number {
  let n = parseFloat(value)

  if (Number.isNaN(n)) {
    return min ?? 0
  }

  if (min !== undefined) {
    n = Math.max(min, n)
  }

  if (max !== undefined) {
    n = Math.min(max, n)
  }

  return n
}

export function NumberField(props: Props) {
  return (
    <TextField
      {...props}
      type="number"
      value={props.value.toString()}
      onChange={e =>
        props.onChange(
          normalizeNumber(e.currentTarget.value, props.min, props.max),
        )
      }
    />
  )
}
