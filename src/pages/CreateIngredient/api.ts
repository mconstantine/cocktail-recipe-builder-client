import * as t from 'io-ts'
import { makeGetRequest, makePostRequest } from '../../api/useApi'
import { Ingredient, IngredientUnit } from '../../globalDomain'
import { IngredientInput } from './domain'

export const createIngredient = makePostRequest({
  url: '/ingredients',
  inputCodec: IngredientInput,
  outputCodec: Ingredient,
})

export const getUnits = makeGetRequest({
  url: '/ingredients/units',
  inputCodec: t.void,
  outputCodec: t.array(IngredientUnit, 'VolumeUnits'),
})
