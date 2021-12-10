import { Add } from '@mui/icons-material'
import {
  Fab,
  List,
  ListItemButton,
  ListItemText,
  Pagination,
  Stack,
  TextField,
  Typography,
} from '@mui/material'
import { option } from 'fp-ts'
import { pipe } from 'fp-ts/function'
import { ChangeEvent, useState } from 'react'
import { useNavigate } from 'react-router'
import { query } from '../../api/api'
import { useGet } from '../../api/useApi'
import { ErrorAlert } from '../../components/ErrorAlert'
import { Link } from '../../components/Link'
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

  const [ingredients] = useGet(getIngredients, input)
  const navigate = useNavigate()

  const [onQueryChange] = useDebounce((query: string) => {
    setInput(input => ({ ...input, query: option.some(query), page: 1 }))
  }, 500)

  return (
    <Stack spacing={4}>
      <Typography variant="h1">Ingredients</Typography>
      <TextField
        label="Search ingredients"
        onChange={e => onQueryChange(e.currentTarget.value)}
        autoFocus
      />
      {pipe(
        ingredients,
        query.fold(
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
              <Stack
                direction="row"
                justifyContent="space-between"
                flexWrap="wrap-reverse"
                spacing={2}
              >
                <Pagination
                  count={ingredients.meta.last_page}
                  onChange={onPageChange}
                  page={input.page}
                />
                <Typography variant="caption" sx={{ py: 2 }}>
                  Total: {ingredients.meta.total}
                </Typography>
              </Stack>
            )

            return (
              <Stack spacing={2}>
                {pagination}
                <nav aria-label="list of ingredients">
                  <List>
                    {ingredients.data.map(ingredient => (
                      <ListItemButton key={ingredient.id}>
                        <Link
                          href={`/ingredients/${ingredient.id}`}
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
      <Fab
        color="primary"
        aria-label="create new ingredient"
        sx={{ position: 'fixed', bottom: 16, right: 16 }}
        onClick={() => navigate('/ingredients/create')}
      >
        <Add />
      </Fab>
    </Stack>
  )
}
