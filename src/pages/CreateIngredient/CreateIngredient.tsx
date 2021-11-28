import { Stack, Typography } from '@mui/material'
import { option } from 'fp-ts'
import { usePost } from '../../api/useApi'
import { IngredientForm } from '../../components/IngredientForm'
import { createIngredient } from './api'

export function CreateIngredient() {
  const command = usePost(createIngredient)

  return (
    <Stack spacing={4}>
      <Typography variant="h1">New Ingredient</Typography>
      <IngredientForm ingredient={option.none} command={command} />
    </Stack>
  )
}
