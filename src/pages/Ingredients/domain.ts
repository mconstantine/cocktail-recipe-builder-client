import * as t from 'io-ts'
import { optionFromNullable } from 'io-ts-types'
import { PaginationInput, PaginationOutput } from '../../api/apiDomain'

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

export const IngredientIndexOutput = t.type(
  {
    id: t.Int,
    name: t.string,
  },
  'IngredientIndexOutput',
)
export type IngredientIndexOutput = t.TypeOf<typeof IngredientIndexOutput>

export const IngredientsOutput = PaginationOutput(IngredientIndexOutput)
export type IngredientsOutput = t.TypeOf<typeof IngredientsOutput>
