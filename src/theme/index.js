import { colors, dark, light } from './colors'
import code from './code'
import buttons from './buttons'
import inputs from './inputs'
import menuItem from './menuItem'
import links from './links'
import dropdown from './dropdown'
import styles from './styles'
import text from './text'
import wells from './wells'
import messages from './messages'
import badges from './badges'

export default {
  useColorSchemeMediaQuery: true,
  colors: {
    ...light,
    modes: {
      dark
    }
  },
  bg: {
    success: colors.green[0],
    danger: colors.red[0],
    warning: colors.yellow[0]
  },
  text,
  breakpoints: ['40em', '52em', '64em', '110em'],
  space: [
    0,
    4,
    8,
    16,
    32,
    64,
    128,
    256,
    512
  ],
  fonts: {
    body: 'Arial',
    heading: 'inherit',
    monospace: 'Inconsolata, monospace'
  },
  fontSizes: [
    12,
    14,
    16,
    20,
    24,
    32,
    48,
    64,
    96
  ],
  fontWeights: {
    body: 400,
    heading: 300,
    bold: 700
  },
  lineHeights: {
    body: 1.5,
    heading: 1.3,
    input: 1.7
  },
  radii: [0, 4, 8, 16, 32],
  shadows: [
    null,
    '0 2px 4px rgba(0, 0, 0, 0.2)',
    '0 4px 8px rgba(0, 0, 0, 0.3)'
  ],
  layout: {
    container: {
      maxWidth: '100em',
      p: [3, null, 4]
    },
    sidebar: {
      width: '250px'
    }
  },
  buttons,
  inputs,
  badges,
  messages,
  code,
  menuItem,
  links,
  dropdown,
  wells,
  styles
}
