import { CocktailProfile } from '../globalDomain'
import { Cocktail } from '../pages/Cocktail/domain'
import { computeDilution } from './computeDilution'

function getContentPct(
  cocktail: Pick<Cocktail, 'name' | 'technique' | 'ingredients'>,
  finalCocktailVolumeMl: number,
  targetUnitName: string,
): number {
  const contentMl =
    cocktail.ingredients.reduce((res, ingredient) => {
      const targetRange = ingredient.ingredient.ranges.find(
        ({ unit: { name } }) => name === targetUnitName,
      )

      if (!targetRange) {
        return res
      }

      const ingredientContentRatio = targetRange.amount / 100
      const ingredientAmountMl = ingredient.amount * (ingredient.unit.ml || 0)

      return res + ingredientContentRatio * ingredientAmountMl
    }, 0) * 100

  return contentMl / finalCocktailVolumeMl
}

export function getCocktailProfile(
  cocktail: Pick<Cocktail, 'name' | 'technique' | 'ingredients'>,
): CocktailProfile {
  const initialIngredientsVolumeMl = cocktail.ingredients
    .filter(({ unit: { type } }) => type === 'VOLUME')
    .reduce(
      (res, ingredient) => res + ingredient.amount * ingredient.unit.ml!,
      0,
    )

  const initialAdditionalVolumeMl = cocktail.ingredients
    .filter(({ unit: { type } }) => type === 'PERCENTAGE')
    .reduce(
      (res, ingredient) =>
        res + (initialIngredientsVolumeMl / 100) * ingredient.amount,
      0,
    )

  const initialVolumeMl = initialIngredientsVolumeMl + initialAdditionalVolumeMl
  const abv = getContentPct(cocktail, initialVolumeMl, 'ABV')

  return {
    volumeMl: initialVolumeMl,
    volumeOz: initialVolumeMl / 30,
    abv,
    sugarContentPct: getContentPct(cocktail, initialVolumeMl, 'Sugar'),
    acidContentPct: getContentPct(cocktail, initialVolumeMl, 'Acid'),
    dilution: computeDilution(abv, cocktail.technique),
  }
}
