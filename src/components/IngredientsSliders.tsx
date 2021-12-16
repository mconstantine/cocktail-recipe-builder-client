import { ArrowUpward, CancelPresentation, Tune } from '@mui/icons-material'
import {
  Button,
  Grid,
  IconButton,
  Input,
  Slider,
  Stack,
  Typography,
} from '@mui/material'
import { Box } from '@mui/system'
import { boolean } from 'fp-ts'
import { constVoid, pipe } from 'fp-ts/function'
import { IO } from 'fp-ts/IO'
import { Reader } from 'fp-ts/Reader'
import { useState } from 'react'
import {
  CocktailIngredient,
  IngredientUnit,
  NonNegative,
} from '../globalDomain'

interface Props {
  ingredients: CocktailIngredient[]
  onChange: Reader<CocktailIngredient[], unknown>
  disabled?: boolean
}

export function IngredientsSliders(props: Props) {
  const [isExpanded, setIsExpanded] = useState(false)

  const onIngredientAmountChange = (ingredient: CocktailIngredient) => {
    props.onChange(
      props.ingredients.map(i => {
        if (i.ingredient.id === ingredient.ingredient.id) {
          return ingredient
        }

        return i
      }),
    )
  }

  const onMoveIngredientUp = (ingredient: CocktailIngredient) => {
    props.onChange([
      ingredient,
      ...props.ingredients.filter(
        i => i.ingredient.id !== ingredient.ingredient.id,
      ),
    ])
  }

  return pipe(
    isExpanded,
    boolean.fold(
      () => (
        <Box>
          <Button startIcon={<Tune />} onClick={() => setIsExpanded(true)}>
            Tune ingredients
          </Button>
        </Box>
      ),
      () => (
        <Stack spacing={2}>
          {props.ingredients.map(ingredient => (
            <IngredientSlider
              key={ingredient.ingredient.id}
              ingredient={ingredient}
              onChange={onIngredientAmountChange}
              onMoveUp={() => onMoveIngredientUp(ingredient)}
            />
          ))}
          <Box>
            <Button
              startIcon={<CancelPresentation />}
              onClick={() => setIsExpanded(false)}
            >
              Close sliders
            </Button>
          </Box>
        </Stack>
      ),
    ),
  )
}

interface IngredientSliderProps {
  ingredient: CocktailIngredient
  onChange: Reader<CocktailIngredient, unknown>
  onMoveUp: IO<unknown>
}

function IngredientSlider(props: IngredientSliderProps) {
  const min = 0
  const [max, setMax] = useState(getMaximum(props.ingredient.unit))
  const step = getStep(props.ingredient.unit)

  const onChange = (value: number) => {
    if (value > max) {
      setMax(value)
    }

    if (NonNegative.is(value) && value !== props.ingredient.amount) {
      props.onChange({
        ...props.ingredient,
        amount: value,
      })
    }
  }

  return (
    <Box>
      <Typography>{props.ingredient.ingredient.name}</Typography>
      <Grid container spacing={2}>
        <Grid item xs>
          <Slider
            value={props.ingredient.amount}
            aria-labelledby="input-slider"
            min={min}
            max={max}
            step={step}
            onChange={(_e, value) =>
              onChange(Array.isArray(value) ? value[0] : value)
            }
          />
        </Grid>
        <Grid item>
          <Input
            value={props.ingredient.amount}
            size="small"
            onChange={e =>
              pipe(parseFloat(e.currentTarget.value), value =>
                pipe(
                  value,
                  Number.isNaN,
                  boolean.fold(() => onChange(value), constVoid),
                ),
              )
            }
            inputProps={{
              min,
              max,
              step,
              'type': 'number',
              'aria-labelledby': 'input-slider',
            }}
            sx={{ maxWidth: '3em' }}
          />
        </Grid>
        <Grid item>
          <IconButton onClick={() => props.onMoveUp()}>
            <ArrowUpward />
          </IconButton>
        </Grid>
      </Grid>
    </Box>
  )
}

function getMaximum(unit: IngredientUnit): number {
  switch (unit.unit) {
    case 'oz':
      return 5
    case 'ml':
      return 150
    case 'cl':
      return 15
    case 'dash':
      return 10
    case 'drop':
      return 20
    case 'tsp':
      return 5
  }
}

function getStep(unit: IngredientUnit): number {
  switch (unit.unit) {
    case 'oz':
      return 0.25
    case 'ml':
      return 0.05
    case 'cl':
      return 0.05
    case 'dash':
      return 1
    case 'drop':
      return 1
    case 'tsp':
      return 1
  }
}
