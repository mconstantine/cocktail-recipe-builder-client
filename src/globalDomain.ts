import * as t from 'io-ts'
import { BooleanFromNumber, DateFromISOString } from 'io-ts-types'

const UnitCommonData = t.type(
  {
    id: t.Int,
    name: t.string,
  },
  'UnitCommonData',
)

export const IngredientUnitName = t.keyof(
  {
    oz: true,
    ml: true,
    cl: true,
    dash: true,
    drop: true,
    tsp: true,
  },
  'IngredientUnitName',
)
export type IngredientUnitName = t.TypeOf<typeof IngredientUnitName>

const PercentageUnit = t.intersection(
  [
    UnitCommonData,
    t.type({
      type: t.literal('PERCENTAGE'),
      ml: t.null,
    }),
  ],
  'PercentageUnit',
)

const VolumeUnit = t.intersection(
  [
    UnitCommonData,
    t.type({
      type: t.literal('VOLUME'),
      ml: t.number,
    }),
  ],
  'VolumeUnit',
)

export const IngredientUnit = t.intersection(
  [
    VolumeUnit,
    t.type({
      unit: IngredientUnitName,
    }),
  ],
  'IngredientUnit',
)
export type IngredientUnit = t.TypeOf<typeof IngredientUnit>

export const RangeUnit = t.intersection(
  [
    PercentageUnit,
    t.type({
      unit: t.literal('%'),
    }),
  ],
  'RangeUnit',
)

const MinMaxRange = t.type(
  {
    min: t.number,
    max: t.number,
    unit: t.union([IngredientUnit, RangeUnit]),
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

export const Range = t.type(
  {
    id: t.Int,
    amount: t.number,
    unit: RangeUnit,
  },
  'Range',
)

export const Ingredient = t.type(
  {
    id: t.Int,
    name: t.string,
    ranges: t.array(Range, 'Ranges'),
  },
  'Ingredient',
)
export type Ingredient = t.TypeOf<typeof Ingredient>

export const CocktailIngredient = t.type(
  {
    amount: t.number,
    unit: IngredientUnit,
    ingredient: Ingredient,
    after_technique: BooleanFromNumber,
  },
  'CocktailIngredient',
)
export type CocktailIngredient = t.TypeOf<typeof CocktailIngredient>

export const Cocktail = t.type(
  {
    id: t.Int,
    name: t.string,
    created_at: DateFromISOString,
    updated_at: DateFromISOString,
    technique: Technique,
    ingredients: t.array(CocktailIngredient, 'Ingredients'),
  },
  'Cocktail',
)
export type Cocktail = t.TypeOf<typeof Cocktail>

export interface CocktailProfile {
  volumeMl: number
  volumeOz: number
  sugarContentPct: number
  acidContentPct: number
  abv: number
  dilution: number
}
