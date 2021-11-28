import { makePostRequest } from '../../api/useApi'
import { IngredientOutput } from '../Ingredient/domain'
import { IngredientInput } from './domain'

export const createIngredient = makePostRequest({
  url: '/ingredients',
  inputCodec: IngredientInput,
  outputCodec: IngredientOutput,
})
