import { Stack, Typography } from '@mui/material'
import { styled } from '@mui/system'
import { option } from 'fp-ts'
import { constNull, pipe } from 'fp-ts/function'
import { useMemo } from 'react'
import { CocktailProfile, Technique } from '../../globalDomain'
import { getTechniqueRanges } from '../../utils/getTechniqueRanges'
import './ProfileGraph.css'

interface Props {
  technique: Technique
  profile: CocktailProfile
}

export function ProfileGraph(props: Props) {
  const ranges = getTechniqueRanges(props.technique)

  return pipe(
    ranges,
    option.fold(constNull, ranges => (
      <Stack className="ProfileGraph" spacing={2}>
        <Typography variant="h6">Balance</Typography>

        <div className="balance-graph">
          {ranges.volume ? (
            <Column
              title="Volume"
              range={ranges.volume}
              value={props.profile.volumeOz}
            />
          ) : null}
          {ranges.abv ? (
            <Column title="ABV" range={ranges.abv} value={props.profile.abv} />
          ) : null}
          {ranges.sugar ? (
            <Column
              title="Sweetness"
              range={ranges.sugar}
              value={props.profile.sugarContentPct}
            />
          ) : null}
          {ranges.acid ? (
            <Column
              title="Acidity"
              range={ranges.acid}
              value={props.profile.acidContentPct}
            />
          ) : null}
          {ranges.dilution ? (
            <Column
              title="Dilution"
              range={ranges.dilution}
              value={props.profile.dilution}
            />
          ) : null}
        </div>
      </Stack>
    )),
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

  const Base = useMemo(
    () =>
      styled('div')(({ theme }) => ({
        backgroundColor: theme.palette.mode === 'dark' ? '#c62828' : '#e57373',
      })),
    [],
  )

  const Min = useMemo(
    () =>
      styled('div')(({ theme }) => ({
        backgroundColor: theme.palette.mode === 'dark' ? '#424242' : '#e0e0e0',
      })),
    [],
  )

  const Max = useMemo(
    () =>
      styled('div')(({ theme }) => ({
        backgroundColor: theme.palette.mode === 'dark' ? '#2e7d32' : '#00e676',
      })),
    [],
  )

  const Value = useMemo(
    () =>
      styled('div')(({ theme }) => ({
        backgroundColor: theme.palette.mode === 'dark' ? '#fff' : '#000',
      })),
    [],
  )

  return (
    <div className="column">
      <div className="values">
        <Base className="base" />
        <Min
          className="min"
          style={{
            height: `${lowest}%`,
          }}
        />
        <Max
          className="max"
          style={{
            height: `${highest}%`,
            top: `${highestOffset}%`,
          }}
        />
        <Value
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
