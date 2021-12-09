import * as t from 'io-ts'
import { TechniqueCode } from '../../globalDomain'

export const CocktailIngredientInput = t.type(
  {
    id: t.number,
    amount: t.number,
    unit: t.string,
  },
  'CocktailIngredientInput',
)
export type CocktailIngredientInput = t.TypeOf<typeof CocktailIngredientInput>

export const CocktailInput = t.type(
  {
    name: t.string,
    technique_code: TechniqueCode,
    ingredients: t.array(CocktailIngredientInput, 'CocktailIngredients'),
  },
  'CocktailInput',
)
export type CocktailInput = t.TypeOf<typeof CocktailInput>