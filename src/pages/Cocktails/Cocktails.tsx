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
import { useGet } from '../../api/useApi'
import { ErrorAlert } from '../../components/ErrorAlert'
import { Link } from '../../components/Link'
import { Loading } from '../../components/Loading'
import { query } from '../../globalDomain'
import { useDebounce } from '../../hooks/useDebounce'
import { getCocktails } from './api'
import { CocktailsInput } from './domain'

export function Cocktails() {
  const [input, setInput] = useState<CocktailsInput>({
    query: option.none,
    page: 1,
    perPage: 20,
  })

  const [cocktails] = useGet(getCocktails, input)
  const navigate = useNavigate()

  const [onQueryChange] = useDebounce((query: string) => {
    setInput(input => ({ ...input, query: option.some(query), page: 1 }))
  }, 500)

  return (
    <Stack spacing={4}>
      <Typography variant="h1">Cocktails</Typography>
      <TextField
        label="Search cocktails"
        onChange={e => onQueryChange(e.currentTarget.value)}
        autoFocus
      />
      {pipe(
        cocktails,
        query.fold(
          () => <Loading />,
          () => (
            <ErrorAlert
              message="An error occurred while fetching the cocktails."
              onRetry={() => setInput(input => ({ ...input, page: 1 }))}
            />
          ),
          cocktails => {
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
                  count={cocktails.meta.last_page}
                  onChange={onPageChange}
                  page={input.page}
                />
                <Typography variant="caption" sx={{ py: 2 }}>
                  Total: {cocktails.meta.total}
                </Typography>
              </Stack>
            )

            return (
              <Stack spacing={2}>
                {pagination}
                <nav aria-label="list of ingredients">
                  <List>
                    {cocktails.data.map(cocktail => (
                      <ListItemButton key={cocktail.id}>
                        <Link
                          href={`/cocktails/${cocktail.id}`}
                          key={cocktail.id}
                          style={{ flexGrow: 1 }}
                        >
                          <ListItemText primary={cocktail.name} />
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
        onClick={() => navigate('/cocktails/create')}
      >
        <Add />
      </Fab>
    </Stack>
  )
}
