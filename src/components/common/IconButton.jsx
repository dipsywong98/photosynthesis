import React from 'react'
import PropTypes from 'prop-types'
import Button from './Button'
import Icon from './Icon'

const IconButton = (props) => {
  return <Button
    variant={props.variant || 'normal-sm'}
    type='button'
    sx={{
      ...props.sx,
      visibility: props.hidden === undefined || props.hidden === null || !props.hidden ? 'unset' : 'hidden',
      overflow: 'hidden'
    }}
    onClick={props.onClick}>
    <Icon path={props.path} sx={props.iconSx} color={props.color} size={props.size}/>
  </Button>
}

IconButton.propTypes = {
  variant: PropTypes.string,
  sx: PropTypes.object,
  iconSx: PropTypes.object,
  path: PropTypes.node,
  onClick: PropTypes.func,
  hidden: PropTypes.bool,
  color: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.func
  ]),
  size: PropTypes.oneOfType([
    PropTypes.number,
    PropTypes.arrayOf(PropTypes.number)
  ])
}

export default IconButton
