import * as t from 'io-ts'
import { makePostRequest, makePutRequest } from '../../api/useApi'
import { LogoutInput, UpdateUserInput } from './domain'

export const logoutUser = makePostRequest({
  url: '/users/logout',
  inputCodec: LogoutInput,
  outputCodec: t.unknown,
})

export const updateProfile = makePutRequest({
  url: '/users/update',
  inputCodec: UpdateUserInput,
  outputCodec: t.unknown,
})
