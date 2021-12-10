import { Ingredient } from '../globalDomain'

export function ingredientRangesToString(ingredient: Ingredient): string {
  return ingredient.ranges
    .map(range => `${range.amount}${range.unit.unit} ${range.unit.name}`)
    .join(', ')
}
