import { makeGetRequest } from '../../api/useApi'
import { CocktailsInput, CocktailsOutput } from './domain'

export const getCocktails = makeGetRequest({
  url: '/cocktails',
  inputCodec: CocktailsInput,
  outputCodec: CocktailsOutput,
})
