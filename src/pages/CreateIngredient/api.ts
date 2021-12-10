import { makePostRequest } from '../../api/useApi'
import { Ingredient } from '../../globalDomain'
import { IngredientInput } from './domain'

export const createIngredient = makePostRequest({
  url: '/ingredients',
  inputCodec: IngredientInput,
  outputCodec: Ingredient,
})
