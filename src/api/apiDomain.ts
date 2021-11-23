import * as t from 'io-ts'
import { optionFromNullable } from 'io-ts-types'

export const PaginationInput = t.type(
  {
    page: t.number,
    perPage: t.number,
  },
  'PaginationInput',
)
export type PaginationInput = t.TypeOf<typeof PaginationInput>

const Meta = t.type(
  {
    total: t.number,
    per_page: t.number,
    current_page: t.number,
    last_page: t.number,
    first_page: t.number,
    first_page_url: t.string,
    last_page_url: t.string,
    next_page_url: optionFromNullable(t.string),
    previous_page_url: optionFromNullable(t.string),
  },
  'Meta',
)

export function PaginationOutput<C extends t.Mixed>(codec: C) {
  return t.type(
    {
      meta: Meta,
      data: t.array(codec, `Data<${codec.name}>`),
    },
    `PaginationOutput<${codec.name}>`,
  )
}
