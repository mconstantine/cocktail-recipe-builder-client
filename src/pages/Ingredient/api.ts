import * as t from 'io-ts'
import { makeGetRequest } from '../../api/useApi'
import { Ingredient } from './domain'

export const getIngredient = (id: number) =>
  makeGetRequest({
    url: `/ingredients/${id}`,
    inputCodec: t.void,
    outputCodec: Ingredient,
  })
