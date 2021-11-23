import * as t from 'io-ts'
import { makeGetRequest } from '../../api/useApi'
import { CocktailOutput } from './domain'

export const getCocktail = (id: number) =>
  makeGetRequest({
    url: `/cocktails/${id}`,
    inputCodec: t.void,
    outputCodec: CocktailOutput,
  })
