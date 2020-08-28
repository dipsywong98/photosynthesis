import { inputPadding } from './inputs/inputPadding'

export default {
  ...inputPadding,
  color: 'text',
  display: 'block',
  ':hover': {
    backgroundColor: 'highlight'
  }
}
