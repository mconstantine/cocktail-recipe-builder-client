import { List, ListItem, ListItemText, Typography } from '@mui/material'
import { Box } from '@mui/system'
import { CocktailProfile, Technique } from '../globalDomain'

interface Props {
  technique: Technique
  profile: CocktailProfile
}

export function CocktailProfileList(props: Props) {
  const dilutionAddendum = 1 + props.profile.dilution / 100
  const volumeMl = props.profile.volumeMl * dilutionAddendum
  const volumeOz = volumeMl / 30
  const abv = props.profile.abv / dilutionAddendum
  const sugarContentPct = props.profile.sugarContentPct / dilutionAddendum
  const acidContentPct = props.profile.acidContentPct / dilutionAddendum

  return (
    <Box>
      <Typography variant="h6">Profile</Typography>
      <List>
        <ListItem>
          <ListItemText primary={props.technique.name} secondary="Technique" />
        </ListItem>
        <ListItem>
          <ListItemText
            primary={`${volumeMl.toFixed(2)} ml (${volumeOz.toFixed(2)} oz)`}
            secondary="Volume"
          />
        </ListItem>
        <ListItem>
          <ListItemText primary={`${abv.toFixed(2)}%`} secondary="ABV" />
        </ListItem>
        <ListItem>
          <ListItemText
            primary={`${sugarContentPct.toFixed(2)}%`}
            secondary="Sugar content"
          />
        </ListItem>
        <ListItem>
          <ListItemText
            primary={`${acidContentPct.toFixed(2)}%`}
            secondary="Acid content"
          />
        </ListItem>
        <ListItem>
          <ListItemText
            primary={`${props.profile.dilution.toFixed(2)}%`}
            secondary="Dilution"
          />
        </ListItem>
      </List>
    </Box>
  )
}
