import * as t from 'io-ts'

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

export const Technique = t.type(
  {
    id: t.Int,
    name: t.string,
    code: t.string,
    ranges: t.array(MinMaxRange),
  },
  'Technique',
)
export type Technique = t.TypeOf<typeof Technique>

interface CocktailProfileCase {
  volumeMl: number
  volumeOz: number
  sugarContentPct: number
  acidContentPct: number
  abv: number
}

export interface CocktailProfile {
  initial: CocktailProfileCase
  minDilution: CocktailProfileCase
  avgDilution: CocktailProfileCase
  maxDilution: CocktailProfileCase
}
