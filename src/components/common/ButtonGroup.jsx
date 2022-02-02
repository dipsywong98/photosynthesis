import React from 'react'
import { Flex } from 'theme-ui'
import PropTypes from 'prop-types'

const ButtonGroup = ({ children, ...props }) => {
  const cc = React.Children.toArray(children)
  return <Flex sx={{ alignItems: 'flex-end' }} {...props}>{
    cc.map((child, k) => {
      const borderLeft = k === 0 ? {} : ({ borderBottomLeftRadius: 0, borderTopLeftRadius: 0 })
      const borderRight = k === cc.length - 1 ? {} : ({ borderBottomRightRadius: 0, borderTopRightRadius: 0 })
      return React.cloneElement(child, { sx: { ...borderLeft, ...borderRight } })
    })
  }</Flex>
}

ButtonGroup.propTypes = {
  children: PropTypes.node
}

export default ButtonGroup
