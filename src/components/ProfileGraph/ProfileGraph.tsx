import { Paper, Stack, Typography, useTheme } from '@mui/material'
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

  return (
    <Paper className="ProfileGraph" elevation={1} sx={{ p: 2 }}>
      <Stack spacing={2}>
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
        </div>
      </Stack>
    </Paper>
  )
}

interface ColumnProps {
  title: string
  range: Technique['ranges'][0]
  value: number
}

function Column(props: ColumnProps) {
  const theme = useTheme()
  const base = Math.max(props.range.min, props.range.max, props.value)

  const lowest = (props.range.min / base) * 100
  const highest = (props.range.max / base) * 100
  const value = (props.value / base) * 100

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
