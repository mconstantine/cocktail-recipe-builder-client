import { Stack, Typography } from '@mui/material'
import { option } from 'fp-ts'
import { useNavigate } from 'react-router'
import { usePost } from '../../api/useApi'
import { IngredientForm } from '../../components/IngredientForm'
import { createIngredient } from './api'

export function CreateIngredient() {
  const navigate = useNavigate()
  const onCancel = () => navigate('/ingredients')

  const command = usePost(createIngredient, ({ id }) =>
    navigate(`/ingredients/${id}`),
  )

  return (
    <Stack spacing={4}>
      <Typography variant="h1">New Ingredient</Typography>
      <IngredientForm
        ingredient={option.none}
        command={command}
        onCancel={onCancel}
        submitLabel="Create"
      />
    </Stack>
  )
}
