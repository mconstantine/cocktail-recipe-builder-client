import * as t from 'io-ts'
import { optionFromNullable } from 'io-ts-types'
import { PaginationInput, PaginationOutput } from '../../api/apiDomain'
import { IngredientWithoutIngredients } from '../../globalDomain'

export const IngredientsInput = t.intersection(
  [
    PaginationInput,
    t.type({
      query: optionFromNullable(t.string),
    }),
  ],
  'IngredientsInput',
)
export type IngredientsInput = t.TypeOf<typeof IngredientsInput>

export const IngredientsOutput = PaginationOutput(IngredientWithoutIngredients)
export type IngredientsOutput = t.TypeOf<typeof IngredientsOutput>
