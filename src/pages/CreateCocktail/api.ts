import * as t from 'io-ts'
import { makeGetRequest, makePostRequest } from '../../api/useApi'
import { Technique, Unit } from '../../globalDomain'
import { Cocktail } from '../Cocktail/domain'
import { CocktailInput } from './domain'

export const createCocktail = makePostRequest({
  url: '/cocktails',
  inputCodec: CocktailInput,
  outputCodec: Cocktail,
})

export const getTechniques = makeGetRequest({
  url: '/techniques',
  inputCodec: t.void,
  outputCodec: t.array(Technique, 'Techniques'),
})

export const getUnits = makeGetRequest({
  url: '/units',
  inputCodec: t.void,
  outputCodec: t.array(Unit, 'Units'),
})
