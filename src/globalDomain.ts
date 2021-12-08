import * as t from 'io-ts'
import { Ingredient } from './pages/Ingredient/domain'

const UnitCommon = t.type(
  {
    id: t.Int,
    name: t.string,
    unit: t.string,
  },
  'UnitCommon',
)

const PercentageUnit = t.intersection(
  [
    UnitCommon,
    t.type({
      type: t.literal('PERCENTAGE'),
      ml: t.null,
    }),
  ],
  'PercentageUnit',
)

const VolumeUnit = t.intersection(
  [
    UnitCommon,
    t.type({
      type: t.literal('VOLUME'),
      ml: t.number,
    }),
  ],
  'VolumeUnit',
)

export const Unit = t.union([PercentageUnit, VolumeUnit], 'Unit')
export type Unit = t.TypeOf<typeof Unit>

const MinMaxRange = t.type(
  {
    min: t.number,
    max: t.number,
    unit: Unit,
  },
  'MinMaxRange',
)

export const TechniqueCode = t.keyof(
  {
    BUILT: true,
    STIRRED: true,
    SHAKEN: true,
    SHAKEN_WITH_EGG: true,
    BLENDED: true,
    CARBONATED: true,
  },
  'TechniqueCode',
)
export type TechniqueCode = t.TypeOf<typeof TechniqueCode>

export const Technique = t.type(
  {
    id: t.Int,
    name: t.string,
    code: TechniqueCode,
    ranges: t.array(MinMaxRange),
  },
  'Technique',
)
export type Technique = t.TypeOf<typeof Technique>

export interface CocktailProfile {
  volumeMl: number
  volumeOz: number
  sugarContentPct: number
  acidContentPct: number
  abv: number
  dilution: number
}

export * as query from './api/Query'

export function getIngredientRanges(ingredient: Ingredient): string {
  return ingredient.ranges
    .map(range => `${range.amount}${range.unit.unit} ${range.unit.name}`)
    .join(', ')
}
