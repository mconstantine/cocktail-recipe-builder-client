import {
  List,
  ListItemButton,
  ListItemText,
  Pagination,
  Stack,
  TextField,
} from '@mui/material'
import { option } from 'fp-ts'
import { pipe } from 'fp-ts/function'
import { ChangeEvent, useState } from 'react'
import { Link } from 'react-router-dom'
import { foldQuery, useGet } from '../../api/useApi'
import { ErrorAlert } from '../../components/ErrorAlert'
import { Loading } from '../../components/Loading'
import { useDebounce } from '../../hooks/useDebounce'
import { getIngredients } from './api'
import { IngredientsInput } from './domain'

export function Ingredients() {
  const [input, setInput] = useState<IngredientsInput>({
    query: option.none,
    page: 1,
    perPage: 20,
  })

  const ingredients = useGet(getIngredients, input)

  const onQueryChange = useDebounce((query: string) => {
    setInput(input => ({ ...input, query: option.some(query), page: 1 }))
  }, 500)

  return (
    <Stack spacing={4}>
      <TextField
        label="Search ingredients"
        onChange={e => onQueryChange(e.currentTarget.value)}
        autoFocus
      />
      {pipe(
        ingredients,
        foldQuery(
          () => <Loading />,
          () => (
            <ErrorAlert
              message="An error occurred while fetching the ingredients."
              onRetry={() => setInput(input => ({ ...input, page: 1 }))}
            />
          ),
          ingredients => {
            const onPageChange = (_e: ChangeEvent<unknown>, page: number) => {
              setInput(input => ({ ...input, page }))
            }

            const pagination = (
              <Pagination
                count={ingredients.meta.last_page}
                onChange={onPageChange}
                page={input.page}
              />
            )

            return (
              <Stack spacing={2}>
                {pagination}
                <nav aria-label="list of ingredients">
                  <List>
                    {ingredients.data.map(ingredient => (
                      <ListItemButton key={ingredient.id}>
                        <Link
                          to={`/ingredients/${ingredient.id}`}
                          key={ingredient.id}
                          style={{ flexGrow: 1 }}
                        >
                          <ListItemText primary={ingredient.name} />
                        </Link>
                      </ListItemButton>
                    ))}
                  </List>
                </nav>
                {pagination}
              </Stack>
            )
          },
        ),
      )}
    </Stack>
  )
}
