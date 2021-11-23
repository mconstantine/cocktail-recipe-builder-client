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
