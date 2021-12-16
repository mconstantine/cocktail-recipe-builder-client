import { NonNegative, Technique, unsafeNonNegative } from '../globalDomain'

export function computeDilution(
  abv: number,
  technique: Technique,
): NonNegative {
  const abvDecimal = abv / 100

  switch (technique.code) {
    case 'BUILT':
      return unsafeNonNegative(24)
    case 'STIRRED':
      return unsafeNonNegative(
        (-1.21 * Math.pow(abvDecimal, 2) + 1.246 * abvDecimal + 0.145) * 100,
      )
    case 'SHAKEN':
    case 'SHAKEN_WITH_EGG':
    case 'CARBONATED':
      return unsafeNonNegative(
        (1.567 * Math.pow(abvDecimal, 2) + 1.742 * abvDecimal + 0.203) * 100,
      )
    case 'BLENDED':
      return unsafeNonNegative(90)
  }
}
