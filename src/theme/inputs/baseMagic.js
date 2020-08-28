import { shortTransition } from '../transitions'
import { inputPadding } from './inputPadding'

export const placeholder = {
  '::placeholder': {
    color: 'transparent'
  }
}

export const fakePlaceholder = {
  position: 'absolute',
  top: '12px',
  pt: '1px',
  left: inputPadding.px,
  pointerEvents: 'none',
  ml: -1,
  px: 1,
  fontSize: 1,
  borderRadius: 1,
  color: 'fgs.1',
  ...shortTransition(['top', 'font-size', 'color', 'background-color'])
}

export const fakePlaceholderPull = {
  backgroundColor: 'background',
  fontSize: 0,
  top: '-10px'
}

export const fakePlaceholderFocus = {
  color: 'blue'
}

export default {
  ...placeholder,
  '+ *': {
    ...fakePlaceholder
  },
  ':not(:placeholder-shown) + *': {
    ...fakePlaceholderPull
  },
  ':focus + *': {
    ...fakePlaceholderPull,
    ...fakePlaceholderFocus
  }
}
