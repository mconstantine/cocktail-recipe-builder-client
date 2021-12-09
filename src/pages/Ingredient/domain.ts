import * as t from 'io-ts'
import { Unit } from '../../globalDomain'

export const Range = t.type(
  {
    id: t.Int,
    amount: t.number,
    unit: Unit,
  },
  'Range',
)

export const Ingredient = t.type(
  {
    id: t.Int,
    name: t.string,
    ranges: t.array(Range, 'Ranges'),
  },
  'Ingredient',
)
export type Ingredient = t.TypeOf<typeof Ingredient>
