import { Typography, useTheme } from '@mui/material'
import { CocktailProfile, Technique } from '../../globalDomain'
import './ProfileGraph.css'

interface Props {
  technique: Technique
  profile: CocktailProfile
}

export function ProfileGraph(props: Props) {
  const dilutionRange = props.technique.ranges.find(
    ({ unit: { name } }) => name === 'Dilution',
  )

  const volumeRange = props.technique.ranges.find(
    ({ unit: { name } }) => name === 'Ounce',
  )

  const abvRange = props.technique.ranges.find(
    ({ unit: { name } }) => name === 'ABV',
  )

  const sugarRange = props.technique.ranges.find(
    ({ unit: { name } }) => name === 'Sugar',
  )

  const acidRange = props.technique.ranges.find(
    ({ unit: { name } }) => name === 'Acid',
  )

  return dilutionRange ? (
    <div className="ProfileGraph">
      {volumeRange ? (
        <Column
          title="Volume"
          range={volumeRange}
          value={props.profile.initial.volumeOz}
        />
      ) : null}
      {abvRange ? (
        <Column
          title="ABV"
          range={abvRange}
          value={props.profile.initial.abv}
        />
      ) : null}
      {sugarRange ? (
        <Column
          title="Sweetness"
          range={sugarRange}
          value={props.profile.initial.sugarContentPct}
        />
      ) : null}
      {acidRange ? (
        <Column
          title="Acidity"
          range={acidRange}
          value={props.profile.initial.acidContentPct}
        />
      ) : null}
    </div>
  ) : null
}

interface ColumnProps {
  title: string
  range: Technique['ranges'][0]
  value: number
}

function Column(props: ColumnProps) {
  const theme = useTheme()
  const max = Math.max(props.range.min, props.range.max, props.value)

  const lowest = (props.range.min / max) * 100
  const highest = (props.range.max / max) * 100
  const value = (props.value / max) * 100

  return (
    <div className="column">
      <div className="values">
        <div
          className="max"
          style={
            {
              'height': `${highest}%`,
              '--color': theme.palette.success.main,
            } as any
          }
        />
        <div
          className="min"
          style={
            {
              'height': `${lowest}%`,
              '--color': theme.palette.error.main,
            } as any
          }
        />
        <div
          className="actual"
          style={
            {
              'height': `${value}%`,
              '--color': theme.palette.text.primary,
            } as any
          }
        />
      </div>
      <Typography sx={{ mt: 2 }}>{props.title}</Typography>
    </div>
  )
}
