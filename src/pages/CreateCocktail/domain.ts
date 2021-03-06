import * as t from 'io-ts'
import { nonEmptyArray, NonEmptyString, optionFromNullable } from 'io-ts-types'
import { VolumeUnitName, TechniqueCode } from '../../globalDomain'

export const CocktailIngredientInput = t.type(
  {
    id: t.number,
    amount: t.number,
    unit: VolumeUnitName,
    after_technique: t.boolean,
  },
  'CocktailIngredientInput',
)
export type CocktailIngredientInput = t.TypeOf<typeof CocktailIngredientInput>

export const CocktailInput = t.type(
  {
    name: t.string,
    technique_code: TechniqueCode,
    ingredients: t.array(CocktailIngredientInput, 'CocktailIngredients'),
    recipe: optionFromNullable(nonEmptyArray(NonEmptyString)),
    garnish: optionFromNullable(NonEmptyString),
  },
  'CocktailInput',
)
export type CocktailInput = t.TypeOf<typeof CocktailInput>
