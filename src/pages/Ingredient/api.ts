import * as t from 'io-ts'
import { makeGetRequest } from '../../api/useApi'
import { IngredientOutput } from './domain'

export const getIngredient = (id: number) =>
  makeGetRequest({
    url: `/ingredients/${id}`,
    inputCodec: t.void,
    outputCodec: IngredientOutput,
  })
