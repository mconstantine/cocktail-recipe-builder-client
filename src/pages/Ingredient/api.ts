import * as t from 'io-ts'
import {
  makeDeleteRequest,
  makeGetRequest,
  makePutRequest,
} from '../../api/useApi'
import { Ingredient } from '../../globalDomain'
import { IngredientInput } from '../CreateIngredient/domain'

export const getIngredient = (id: number) =>
  makeGetRequest({
    url: `/ingredients/${id}`,
    inputCodec: t.void,
    outputCodec: Ingredient,
  })

export const updateIngredient = (id: number) =>
  makePutRequest({
    url: `/ingredients/${id}`,
    inputCodec: IngredientInput,
    outputCodec: Ingredient,
  })

export const deleteIngredient = (id: number) =>
  makeDeleteRequest({
    url: `/ingredients/${id}`,
    inputCodec: t.void,
    outputCodec: Ingredient,
  })
