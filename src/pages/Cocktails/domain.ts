import * as t from 'io-ts'
import { optionFromNullable } from 'io-ts-types'
import { PaginationInput, PaginationOutput } from '../../api/apiDomain'

export const CocktailsInput = t.intersection(
  [
    PaginationInput,
    t.type({
      query: optionFromNullable(t.string),
    }),
  ],
  'CocktailsInput',
)
export type CocktailsInput = t.TypeOf<typeof CocktailsInput>

export const CocktailsOutput = PaginationOutput(
  t.type(
    {
      id: t.Int,
      name: t.string,
    },
    'CocktailsOutput',
  ),
)
export type CocktailsOutput = t.TypeOf<typeof CocktailsOutput>
