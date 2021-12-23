import { IngredientWithoutIngredients } from '../globalDomain'

export function ingredientRangesToString(
  ingredient: IngredientWithoutIngredients,
): string {
  return ingredient.ranges
    .map(range => `${range.amount}${range.unit.unit} ${range.unit.name}`)
    .join(', ')
}
