import { shortTransition } from './transitions'
import { inputPadding, mdInputPadding, smInputPadding } from './inputs/inputPadding'
import { baseInput } from './inputs/baseInput'

export const baseButton = {
  ...baseInput,
  ...inputPadding,
  ...shortTransition(['background-color']),
  display: 'inline-flex',
  alignItems: 'center',
  textAlign: 'unset',
  outline: 'none',
  '::-moz-focus-inner': {
    border: 'none'
  },
  cursor: 'pointer',
  ':disabled': {
    cursor: 'default'
  }
}

export const pillButton = {
  borderRadius: 4
}

export const smButton = {
  ...baseButton,
  ...smInputPadding
}

export const mdButton = {
  ...baseButton,
  ...mdInputPadding
}

export const borderlessButton = {
  ...baseButton,
  border: 0
}

export const borderlessSmButton = {
  ...smButton,
  border: 0
}

export const borderlessMdButton = {
  ...mdButton,
  border: 0
}

const buttonStyles = {
  '': baseButton,
  '-sm': smButton,
  '-md': mdButton,
  '-borderless': borderlessButton,
  '-borderless-sm': borderlessSmButton,
  '-borderless-md': borderlessMdButton,
  '-pill': { ...baseButton, ...pillButton, px: 5 },
  '-pill-sm': { ...smButton, ...pillButton, px: 3 },
  '-pill-md': { ...mdButton, ...pillButton, px: 4 }
}

const buttonColors = {
  normal: {
    fg: 'text',
    bg: 'background',
    hoverBg: 'highlight'
  },
  primary: {
    fg: 'white.0',
    bg: 'blue.0',
    hoverBg: 'blue.1'
  },
  success: {
    fg: 'white.0',
    bg: 'blue.0',
    hoverBg: 'blue.1'
  },
  warning: {
    fg: 'dark.0',
    bg: 'yellow.0',
    hoverBg: 'yellow.1'
  },
  danger: {
    fg: 'white.0',
    bg: 'red.0',
    hoverBg: 'red.1'
  },
  red: {
    fg: 'white.0',
    bg: 'red.0',
    hoverBg: 'red.1'
  },
  active: {
    fg: 'white.0',
    bg: 'blue.0'
  },
  transparent: {
    fg: 'fgs.0',
    bg: 'transparent',
    hoverBg: 'highlight',
    border: 0
  }
}

/**
 * @type {Record<string, any>}
 */
const buttons = {}

for (const styleName in buttonStyles) {
  for (const colorName in buttonColors) {
    buttons[colorName + styleName] = {
      ...buttonStyles[styleName],
      backgroundColor: buttonColors[colorName].bg,
      color: buttonColors[colorName].fg,
      '*': {
        fill: buttonColors[colorName].fg
      },
      ':hover': {
        backgroundColor: buttonColors[colorName].hoverBg
      },
      '&:disabled': {
        backgroundColor: 'light.0',
        color: 'light.1'
      }
    }
  }
}

export default buttons
