import { option } from 'fp-ts'
import { Option } from 'fp-ts/Option'
import { MinMaxRange, Technique } from '../globalDomain'

interface TechniqueRanges {
  volume: MinMaxRange
  abv: MinMaxRange
  sugar: MinMaxRange
  acid: MinMaxRange
  dilution: MinMaxRange
}

export function getTechniqueRanges(
  technique: Technique,
): Option<TechniqueRanges> {
  const volume = technique.ranges.find(({ unit: { name } }) => name === 'Ounce')
  const abv = technique.ranges.find(({ unit: { name } }) => name === 'ABV')
  const sugar = technique.ranges.find(({ unit: { name } }) => name === 'Sugar')
  const acid = technique.ranges.find(({ unit: { name } }) => name === 'Acid')

  const dilution = technique.ranges.find(
    ({ unit: { name } }) => name === 'Dilution',
  )

  if (!volume || !abv || !sugar || !acid || !dilution) {
    return option.none
  }

  return option.some({
    volume,
    abv,
    sugar,
    acid,
    dilution,
  })
}
