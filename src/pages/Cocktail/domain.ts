import * as t from 'io-ts'
import { DateFromISOString } from 'io-ts-types'
import { Technique, Unit } from '../../globalDomain'
import { Range } from '../Ingredient/domain'

const CocktailIngredient = t.type(
  {
    id: t.Int,
    amount: t.number,
    unit: Unit,
    ingredient: t.type(
      {
        id: t.Int,
        name: t.string,
        ranges: t.array(Range),
      },
      'Ingredient',
    ),
  },
  'CocktailIngredient',
)

export const CocktailOutput = t.type(
  {
    id: t.Int,
    name: t.string,
    created_at: DateFromISOString,
    updated_at: DateFromISOString,
    technique: Technique,
    ingredients: t.array(CocktailIngredient, 'Ingredients'),
  },
  'Cocktail',
)
export type CocktailOutput = t.TypeOf<typeof CocktailOutput>
