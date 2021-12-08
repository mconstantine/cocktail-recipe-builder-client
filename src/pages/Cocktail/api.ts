import * as t from 'io-ts'
import { makeGetRequest } from '../../api/useApi'
import { Cocktail } from './domain'

export const getCocktail = (id: number) =>
  makeGetRequest({
    url: `/cocktails/${id}`,
    inputCodec: t.void,
    outputCodec: Cocktail,
  })
