import { either } from 'fp-ts'
import { identity, pipe } from 'fp-ts/function'
import * as t from 'io-ts'
import {
  BooleanFromNumber,
  DateFromISOString,
  NonEmptyString,
  optionFromNullable,
} from 'io-ts-types'

interface NonNegativeBrand {
  readonly NonNegative: unique symbol
}

export const NonNegative = t.brand(
  t.number,
  (n): n is t.Branded<number, NonNegativeBrand> => n >= 0,
  'NonNegative',
)
export type NonNegative = t.TypeOf<typeof NonNegative>

export function unsafeNonNegative(n: number): NonNegative {
  return pipe(
    NonNegative.decode(n),
    either.fold(() => {
      throw new Error(`Unsafe NonNegative failed: ${n}`)
    }, identity),
  )
}

interface PositiveBrand {
  readonly Positive: unique symbol
}

export const Positive = t.brand(
  t.number,
  (n): n is t.Branded<number, PositiveBrand> => n > 0,
  'Positive',
)
export type Positive = t.TypeOf<typeof Positive>

export function unsafePositive(n: number): Positive {
  return pipe(
    Positive.decode(n),
    either.fold(() => {
      throw new Error(`Unsafe Positive failed: ${n}`)
    }, identity),
  )
}

export const NonNegativeInteger = t.intersection(
  [t.Int, NonNegative],
  'NonNegativeInteger',
)
export type NonNegativeInteger = t.TypeOf<typeof NonNegativeInteger>

export function unsafeNonNegativeInteger(n: number): NonNegativeInteger {
  return pipe(
    NonNegativeInteger.decode(n),
    either.fold(() => {
      throw new Error(`Unsafe NonNegativeInteger failed: ${n}`)
    }, identity),
  )
}

export const PositiveInteger = t.intersection(
  [t.Int, Positive],
  'PositiveInteger',
)
export type PositiveInteger = t.TypeOf<typeof PositiveInteger>

export function unsafePositiveInteger(n: number): PositiveInteger {
  return pipe(
    PositiveInteger.decode(n),
    either.fold(() => {
      throw new Error(`Unsafe PositiveInteger failed: ${n}`)
    }, identity),
  )
}

const UnitCommonData = t.type(
  {
    id: PositiveInteger,
    name: NonEmptyString,
  },
  'UnitCommonData',
)

export const VolumeUnitName = t.keyof(
  {
    oz: true,
    ml: true,
    cl: true,
    dash: true,
    drop: true,
    tsp: true,
  },
  'VolumeUnitName',
)
export type VolumeUnitName = t.TypeOf<typeof VolumeUnitName>

export const WeightUnitName = t.keyof(
  {
    g: true,
    mg: true,
    kg: true,
  },
  'WeightUnitName',
)
export type WeightUnitName = t.TypeOf<typeof WeightUnitName>

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

export const VolumeUnit = t.intersection(
  [
    UnitCommonData,
    t.type({
      type: t.literal('VOLUME'),
      ml: NonNegative,
      unit: VolumeUnitName,
    }),
  ],
  'VolumeUnit',
)
export type VolumeUnit = t.TypeOf<typeof VolumeUnit>

const WeightUnit = t.intersection(
  [
    UnitCommonData,
    t.type({
      type: t.literal('WEIGHT'),
      ml: t.null,
      unit: WeightUnitName,
    }),
  ],
  'WeightUnit',
)

export const RangeUnit = t.intersection(
  [
    PercentageUnit,
    t.type({
      unit: t.literal('%'),
    }),
  ],
  'RangeUnit',
)

export const MinMaxRange = t.type(
  {
    min: NonNegative,
    max: NonNegative,
    unit: t.union([VolumeUnit, RangeUnit]),
  },
  'MinMaxRange',
)
export type MinMaxRange = t.TypeOf<typeof MinMaxRange>

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
    id: PositiveInteger,
    name: NonEmptyString,
    code: TechniqueCode,
    ranges: t.array(MinMaxRange),
  },
  'Technique',
)
export type Technique = t.TypeOf<typeof Technique>

export const Range = t.type(
  {
    id: PositiveInteger,
    amount: NonNegative,
    unit: RangeUnit,
  },
  'Range',
)

const RecipeStep = t.type({
  index: NonNegativeInteger,
  step: NonEmptyString,
})

export const IngredientWithoutIngredients = t.type(
  {
    id: PositiveInteger,
    name: NonEmptyString,
    ranges: t.array(Range, 'Ranges'),
  },
  'IngredientWithoutIngredients',
)
export type IngredientWithoutIngredients = t.TypeOf<
  typeof IngredientWithoutIngredients
>

export const IngredientUnit = t.union(
  [VolumeUnit, WeightUnit],
  'IngredientUnit',
)
export type IngredientUnit = t.TypeOf<typeof IngredientUnit>

export const IngredientIngredient = t.type(
  {
    amount: NonNegative,
    unit: IngredientUnit,
    ingredient: IngredientWithoutIngredients,
  },
  'IngredientIngredient',
)
export type IngredientIngredient = t.TypeOf<typeof IngredientIngredient>

export const Ingredient = t.intersection([
  IngredientWithoutIngredients,
  t.type({
    ingredients: t.array(IngredientIngredient, 'Ingredients'),
    recipe: t.array(RecipeStep),
  }),
])
export type Ingredient = t.TypeOf<typeof Ingredient>

export const CocktailIngredient = t.type(
  {
    amount: NonNegative,
    unit: VolumeUnit,
    ingredient: IngredientWithoutIngredients,
    after_technique: BooleanFromNumber,
  },
  'CocktailIngredient',
)
export type CocktailIngredient = t.TypeOf<typeof CocktailIngredient>

export const Cocktail = t.type(
  {
    id: PositiveInteger,
    name: NonEmptyString,
    created_at: DateFromISOString,
    updated_at: DateFromISOString,
    technique: Technique,
    ingredients: t.array(CocktailIngredient, 'Ingredients'),
    recipe: t.array(RecipeStep),
    garnish: optionFromNullable(NonEmptyString),
  },
  'Cocktail',
)
export type Cocktail = t.TypeOf<typeof Cocktail>

export interface CocktailProfile {
  volumeMl: NonNegative
  volumeOz: NonNegative
  sugarContentPct: NonNegative
  acidContentPct: NonNegative
  abv: NonNegative
  dilution: NonNegative
}
