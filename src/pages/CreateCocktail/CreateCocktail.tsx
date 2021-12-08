import { Stack, Typography } from '@mui/material'
import { option } from 'fp-ts'
import { useNavigate } from 'react-router'
import { usePost } from '../../api/useApi'
import { CocktailForm } from '../../components/CocktailForm/CocktailForm'
import { createCocktail } from './api'

export function CreateCocktail() {
  const navigate = useNavigate()
  const onCancel = () => navigate('/cocktails')

  const command = usePost(createCocktail, ({ id }) =>
    navigate(`/cocktails/${id}`),
  )

  return (
    <Stack spacing={4}>
      <Typography variant="h1">New Cocktail</Typography>
      <CocktailForm
        cocktail={option.none}
        command={command}
        onCancel={onCancel}
        submitLabel="Create"
      />
    </Stack>
  )
}
