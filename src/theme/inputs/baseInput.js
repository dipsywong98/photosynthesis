import { shortTransition } from '../transitions'

export const baseInput = {
  borderRadius: 1,
  border: '1px solid',
  borderColor: 'border',
  ...shortTransition(['box-shadow']),
  boxShadow: '0 0 0 0 transparent',
  ':focus, &.focus': {
    boxShadow: theme => `0 0 0 3px ${theme.colors.inputFocus}`,
    borderColor: 'unset'
  },
  lineHeight: 'input',
  backgroundColor: 'transparent',
  color: 'text',
  fontFamily: 'body',
  fontWeight: 'body',
  fontSize: 1
}
