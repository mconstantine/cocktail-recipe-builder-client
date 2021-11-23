import { CocktailProfile } from '../globalDomain'
import { CocktailOutput } from '../pages/Cocktail/domain'

function getContentPct(
  cocktail: CocktailOutput,
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

export function getCocktailProfile(cocktail: CocktailOutput): CocktailProfile {
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

  const dilutionRange = cocktail.technique.ranges.find(
    ({ unit }) => unit.name === 'Dilution',
  ) || { min: 0, max: 0 }

  const minDilution = dilutionRange.min
  const maxDilution = dilutionRange.max
  const avgDilution = (minDilution + maxDilution) / 2

  const minVolumeMl = initialVolumeMl + (initialVolumeMl / 100) * minDilution
  const maxVolumeMl = initialVolumeMl + (initialVolumeMl / 100) * maxDilution
  const avgVolumeMl = initialVolumeMl + (initialVolumeMl / 100) * avgDilution

  return {
    initial: {
      volumeMl: initialVolumeMl,
      volumeOz: initialVolumeMl / 30,
      abv: getContentPct(cocktail, initialVolumeMl, 'ABV'),
      sugarContentPct: getContentPct(cocktail, initialVolumeMl, 'Sugar'),
      acidContentPct: getContentPct(cocktail, initialVolumeMl, 'Acid'),
    },
    minDilution: {
      volumeMl: minVolumeMl,
      volumeOz: minVolumeMl / 30,
      abv: getContentPct(cocktail, minVolumeMl, 'ABV'),
      sugarContentPct: getContentPct(cocktail, minVolumeMl, 'Sugar'),
      acidContentPct: getContentPct(cocktail, minVolumeMl, 'Acid'),
    },
    avgDilution: {
      volumeMl: avgVolumeMl,
      volumeOz: avgVolumeMl / 30,
      abv: getContentPct(cocktail, avgVolumeMl, 'ABV'),
      sugarContentPct: getContentPct(cocktail, avgVolumeMl, 'Sugar'),
      acidContentPct: getContentPct(cocktail, avgVolumeMl, 'Acid'),
    },
    maxDilution: {
      volumeMl: maxVolumeMl,
      volumeOz: maxVolumeMl / 30,
      abv: getContentPct(cocktail, maxVolumeMl, 'ABV'),
      sugarContentPct: getContentPct(cocktail, maxVolumeMl, 'Sugar'),
      acidContentPct: getContentPct(cocktail, maxVolumeMl, 'Acid'),
    },
  }
}
