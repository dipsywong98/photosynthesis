/** @jsx jsx */
import {ButtonProps, jsx} from 'theme-ui'
import {Button as ThemeUIButton} from '@theme-ui/components'
import PropTypes from 'prop-types'
import {forwardRef, FunctionComponent} from 'react'
import {isDefined} from '../../utils/componentHelpers'

const buttonProps = {
  block: PropTypes.bool
}

type MyButtonProps = PropTypes.InferProps<typeof buttonProps>

const Button: FunctionComponent<MyButtonProps & ButtonProps> = forwardRef<HTMLButtonElement, MyButtonProps & ButtonProps>((props, ref) => (
  <ThemeUIButton
    ref={ref}
    variant='normal'
    sx={{
      display: isDefined(props.block) && props.block ? 'flex' : undefined,
      width: isDefined(props.block) && props.block ? '100%' : undefined,
      justifyContent: isDefined(props.block) && props.block ? 'center' : undefined,
      position: 'relative'
    }}
    {...props}
  />
))

Button.propTypes = buttonProps

Button.defaultProps = {
  block: false
}

Button.displayName = 'Button'

export default Button
