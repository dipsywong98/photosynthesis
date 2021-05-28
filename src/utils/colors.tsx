import { Color, COLOR_VALUES } from '../3d/constants'
import { darken, lighten } from 'polished'

export const colorsFromPlayerColor = (colorMode: string | undefined, playerColor: Color): [string, string] => {
  const color = '#' + COLOR_VALUES[playerColor].toString(16)
  const darker = darken(0.1)(color)
  const lighter = lighten(0.2)(color)
  return colorMode === 'dark' ? [darker, lighter] : [lighter, darker]
}
