import { Stack, Typography } from '@mui/material'
import { option } from 'fp-ts'
import { useNavigate } from 'react-router'
import { usePost } from '../../api/useApi'
import { IngredientForm } from '../../components/IngredientForm'
import { Ingredient } from '../Ingredient/domain'
import { createIngredient } from './api'

export function CreateIngredient() {
  const command = usePost(createIngredient)
  const navigate = useNavigate()

  const onSubmit = ({ id }: Ingredient) => navigate(`/ingredients/${id}`)
  const onCancel = () => navigate('/ingredients')

  return (
    <Stack spacing={4}>
      <Typography variant="h1">New Ingredient</Typography>
      <IngredientForm
        ingredient={option.none}
        command={command}
        onSubmit={onSubmit}
        onCancel={onCancel}
        submitLabel="Create"
      />
    </Stack>
  )
}
