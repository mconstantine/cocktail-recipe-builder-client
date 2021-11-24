import { Stack, Typography } from '@mui/material'
import { CocktailProfile, Technique } from '../../globalDomain'
import './ProfileGraph.css'

interface Props {
  technique: Technique
  profile: CocktailProfile
}

export function ProfileGraph(props: Props) {
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

  const dilutionRange = props.technique.ranges.find(
    ({ unit: { name } }) => name === 'Dilution',
  )

  return (
    <Stack className="ProfileGraph" spacing={2}>
      <Typography variant="h6">Balance</Typography>

      <div className="balance-graph">
        {volumeRange ? (
          <Column
            title="Volume"
            range={volumeRange}
            value={props.profile.volumeOz}
          />
        ) : null}
        {abvRange ? (
          <Column title="ABV" range={abvRange} value={props.profile.abv} />
        ) : null}
        {sugarRange ? (
          <Column
            title="Sweetness"
            range={sugarRange}
            value={props.profile.sugarContentPct}
          />
        ) : null}
        {acidRange ? (
          <Column
            title="Acidity"
            range={acidRange}
            value={props.profile.acidContentPct}
          />
        ) : null}
        {dilutionRange ? (
          <Column
            title="Dilution"
            range={dilutionRange}
            value={props.profile.dilution}
          />
        ) : null}
      </div>
    </Stack>
  )
}

interface ColumnProps {
  title: string
  range: Technique['ranges'][0]
  value: number
}

function Column(props: ColumnProps) {
  const base = Math.max(props.range.min, props.range.max, props.value)
  const lowest = (props.range.min / base) * 100
  const max = (props.range.max / base) * 100
  const highest = max - lowest
  const highestOffset = 100 - max
  const value = (props.value / base) * 100

  return (
    <div className="column">
      <div className="values">
        <div className="base" />
        <div
          className="min"
          style={{
            height: `${lowest}%`,
          }}
        />
        <div
          className="max"
          style={{
            height: `${highest}%`,
            top: `${highestOffset}%`,
          }}
        />
        <div
          className="actual"
          style={{
            height: `${value}%`,
          }}
        />
      </div>
      <Typography sx={{ mt: 2 }}>{props.title}</Typography>
    </div>
  )
}
