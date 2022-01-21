import * as t from 'io-ts'

export const LogoutInput = t.type(
  {
    logout_from_everywhere: t.boolean,
  },
  'LogoutInput',
)
