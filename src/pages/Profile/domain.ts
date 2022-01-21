import * as t from 'io-ts'
import { NonEmptyString } from 'io-ts-types'

export const LogoutInput = t.type(
  {
    logout_from_everywhere: t.boolean,
  },
  'LogoutInput',
)

export const UpdateUserInput = t.type(
  {
    new_password: NonEmptyString,
  },
  'UpdateUserInput',
)
