import { makeGetRequest } from '../../api/useApi'
import { IngredientsInput, IngredientsOutput } from './domain'

export const getIngredients = makeGetRequest({
  url: '/ingredients',
  inputCodec: IngredientsInput,
  outputCodec: IngredientsOutput,
})
