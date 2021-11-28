import * as t from 'io-ts'

export const IngredientInput = t.type(
  {
    name: t.string,
    abv: t.number,
    sugar: t.number,
    acid: t.number,
  },
  'IngredientInput',
)
export type IngredientInput = t.TypeOf<typeof IngredientInput>
