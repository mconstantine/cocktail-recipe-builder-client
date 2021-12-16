import * as t from 'io-ts'
import { NonEmptyString } from 'io-ts-types'
import { NonNegative } from '../../globalDomain'

export const IngredientInput = t.type(
  {
    name: NonEmptyString,
    abv: NonNegative,
    sugar: NonNegative,
    acid: NonNegative,
  },
  'IngredientInput',
)
export type IngredientInput = t.TypeOf<typeof IngredientInput>
