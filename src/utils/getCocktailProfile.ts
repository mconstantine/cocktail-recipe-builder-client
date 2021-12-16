import {
  Cocktail,
  CocktailIngredient,
  CocktailProfile,
  NonNegative,
  unsafeNonNegative,
} from '../globalDomain'
import { computeDilution } from './computeDilution'

function getContentPct(
  ingredients: CocktailIngredient[],
  finalCocktailVolumeMl: number,
  targetUnitName: string,
): NonNegative {
  const contentMl = ingredients.reduce((res, ingredient) => {
    const targetRange = ingredient.ingredient.ranges.find(
      ({ unit: { name } }) => name === targetUnitName,
    )

    if (!targetRange) {
      return res
    }

    const ingredientContentRatio = targetRange.amount / 100
    const ingredientAmountMl = ingredient.amount * ingredient.unit.ml

    return res + ingredientContentRatio * ingredientAmountMl
  }, 0)

  return unsafeNonNegative((contentMl / finalCocktailVolumeMl) * 100)
}

export function getCocktailProfile(
  cocktail: Pick<Cocktail, 'name' | 'technique' | 'ingredients'>,
): CocktailProfile {
  const initialVolumeMl = cocktail.ingredients.reduce(
    (res, ingredient) => res + ingredient.amount * ingredient.unit.ml,
    0,
  )

  const ingredientsBeforeTechnique = cocktail.ingredients.filter(
    ({ after_technique }) => !after_technique,
  )

  const abvBeforeTechnique = getContentPct(
    ingredientsBeforeTechnique,
    initialVolumeMl,
    'ABV',
  )
  const dilution = computeDilution(abvBeforeTechnique, cocktail.technique)
  const dilutionAddendum = 1 + dilution / 100
  const finalVolumeMl = initialVolumeMl * dilutionAddendum

  return {
    volumeMl: unsafeNonNegative(finalVolumeMl),
    volumeOz: unsafeNonNegative(finalVolumeMl / 30),
    abv: getContentPct(cocktail.ingredients, finalVolumeMl, 'ABV'),
    sugarContentPct: getContentPct(
      cocktail.ingredients,
      finalVolumeMl,
      'Sugar',
    ),
    acidContentPct: getContentPct(cocktail.ingredients, finalVolumeMl, 'Acid'),
    dilution,
  }
}
