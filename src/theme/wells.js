import { colors } from './colors'
import { transparentize } from 'polished'

export const baseWell = {
  p: 3,
  px: 3,
  py: 3,
  my: 3,
  borderRadius: 1,
  borderWidth: 1,
  borderStyle: 'solid',
  borderColor: 'border'
}

export default {
  normal: {
    ...baseWell
  },
  dashed: {
    ...baseWell,
    borderStyle: 'dashed'
  },
  primary: {
    ...baseWell,
    borderColor: 'blue.1'
  },
  danger: {
    ...baseWell,
    borderColor: 'red.1',
    backgroundColor: transparentize(0.7, colors.red)
  },
  warning: {
    ...baseWell,
    borderColor: 'yellow.1'
  },
  success: {
    ...baseWell,
    borderColor: 'green.1',
    backgroundColor: transparentize(0.7, colors.green)
  }
}
