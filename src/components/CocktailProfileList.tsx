import { List, ListItem, ListItemText, Typography } from '@mui/material'
import { Box } from '@mui/system'
import { option } from 'fp-ts'
import { constNull, pipe } from 'fp-ts/function'
import { CocktailProfile, MinMaxRange, Technique } from '../globalDomain'
import { getTechniqueRanges } from '../utils/getTechniqueRanges'

interface Props {
  technique: Technique
  profile: CocktailProfile
}

export function CocktailProfileList(props: Props) {
  const { volumeMl, volumeOz, abv, sugarContentPct, acidContentPct, dilution } =
    props.profile
  const ranges = getTechniqueRanges(props.technique)

  return pipe(
    ranges,
    option.fold(constNull, ranges => (
      <Box>
        <Typography variant="h6">Profile</Typography>
        <List>
          <ListItem>
            <ListItemText
              primary={props.technique.name}
              secondary="Technique"
            />
          </ListItem>
          <ListItem>
            <ListItemText
              primary={`${volumeMl.toFixed(2)} ml (${volumeOz.toFixed(2)} oz)`}
              secondary={`Volume (${computeBalance(volumeOz, ranges.volume)})`}
            />
          </ListItem>
          <ListItem>
            <ListItemText
              primary={`${abv.toFixed(2)}%`}
              secondary={`ABV (${computeBalance(abv, ranges.abv)})`}
            />
          </ListItem>
          <ListItem>
            <ListItemText
              primary={`${sugarContentPct.toFixed(2)}%`}
              secondary={`Sugar content (${computeBalance(
                sugarContentPct,
                ranges.sugar,
              )})`}
            />
          </ListItem>
          <ListItem>
            <ListItemText
              primary={`${acidContentPct.toFixed(2)}%`}
              secondary={`Acid content (${computeBalance(
                acidContentPct,
                ranges.acid,
              )})`}
            />
          </ListItem>
          <ListItem>
            <ListItemText
              primary={`${dilution.toFixed(2)}%`}
              secondary={`Dilution (${computeBalance(
                dilution,
                ranges.dilution,
              )})`}
            />
          </ListItem>
        </List>
      </Box>
    )),
  )
}

function computeBalance(value: number, range: MinMaxRange): string {
  if (value < range.min) {
    const error = (1 - value / range.min) * 100
    return `${error.toFixed(2)}% low`
  } else if (value < range.max) {
    return 'balanced'
  } else {
    const error = (1 - range.max / value) * 100
    return `${error.toFixed(2)}% high`
  }
}
