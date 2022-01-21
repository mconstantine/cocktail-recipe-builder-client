import * as t from 'io-ts'
import { makePostRequest } from '../../api/useApi'
import { LogoutInput } from './domain'

export const logoutUser = makePostRequest({
  url: '/users/logout',
  inputCodec: LogoutInput,
  outputCodec: t.unknown,
})
