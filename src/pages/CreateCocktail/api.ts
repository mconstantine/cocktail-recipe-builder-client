import * as t from 'io-ts'
import { makeGetRequest, makePostRequest } from '../../api/useApi'
import { Technique, IngredientUnit, Cocktail } from '../../globalDomain'
import { CocktailInput } from './domain'

export const createCocktail = makePostRequest({
  url: '/cocktails',
  inputCodec: CocktailInput,
  outputCodec: Cocktail,
})

export const getTechniques = makeGetRequest({
  url: '/techniques',
  inputCodec: t.void,
  outputCodec: t.array(Technique, 'Techniques'),
})

export const getUnits = makeGetRequest({
  url: '/cocktails/units',
  inputCodec: t.void,
  outputCodec: t.array(IngredientUnit, 'IngredientUnits'),
})
