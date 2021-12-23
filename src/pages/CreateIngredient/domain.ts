import * as t from 'io-ts'
import { nonEmptyArray, NonEmptyString, optionFromNullable } from 'io-ts-types'
import {
  NonNegative,
  PositiveInteger,
  VolumeUnitName,
  WeightUnitName,
} from '../../globalDomain'

const IngredientIngredientInput = t.type({
  id: PositiveInteger,
  amount: NonNegative,
  unit: t.union([VolumeUnitName, WeightUnitName], 'Unit'),
})

export const IngredientInput = t.type(
  {
    name: NonEmptyString,
    abv: NonNegative,
    sugar: NonNegative,
    acid: NonNegative,
    ingredients: optionFromNullable(nonEmptyArray(IngredientIngredientInput)),
    recipe: optionFromNullable(nonEmptyArray(NonEmptyString)),
  },
  'IngredientInput',
)
export type IngredientInput = t.TypeOf<typeof IngredientInput>
