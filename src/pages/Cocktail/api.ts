import * as t from 'io-ts'
import {
  makeDeleteRequest,
  makeGetRequest,
  makePutRequest,
} from '../../api/useApi'
import { Cocktail } from '../../globalDomain'
import { CocktailInput } from '../CreateCocktail/domain'

export const getCocktail = (id: number) =>
  makeGetRequest({
    url: `/cocktails/${id}`,
    inputCodec: t.void,
    outputCodec: Cocktail,
  })

export const deleteCocktail = (id: number) =>
  makeDeleteRequest({
    url: `/cocktails/${id}`,
    inputCodec: t.void,
    outputCodec: Cocktail,
  })

export const updateCocktail = (id: number) =>
  makePutRequest({
    url: `/cocktails/${id}`,
    inputCodec: CocktailInput,
    outputCodec: Cocktail,
  })
