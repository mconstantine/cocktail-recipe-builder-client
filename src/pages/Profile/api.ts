import * as t from 'io-ts'
import { makePostRequest } from '../../api/useApi'

export const logoutUser = makePostRequest({
  url: '/users/logout',
  inputCodec: t.void,
  outputCodec: t.unknown,
})
