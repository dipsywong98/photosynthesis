import React, { FunctionComponent } from 'react'
import { FlexProps } from 'theme-ui'
import { Flex, Text } from '@theme-ui/components'
import PropTypes, { InferProps } from 'prop-types'
import Icon from './Icon'

const iconTextProps = {
  path: PropTypes.string.isRequired,
  children: PropTypes.node.isRequired,
  size: PropTypes.number,
  color: PropTypes.any,
  reverse: PropTypes.bool
}

export interface IconTextProps extends InferProps<typeof iconTextProps> {
  color?: string | ((x: unknown) => string) | null
}

const IconText: FunctionComponent<IconTextProps & FlexProps> = ({ children, color, path, size, reverse = false, ...otherProps }) => {
  const reverse_ = reverse ?? false
  return (
    <Flex sx={{ alignItems: 'center', flexDirection: reverse_ ? 'row-reverse' : 'row' }} {...otherProps}>
      <Icon
        size={size}
        path={path}
        color={color}
        sx={{
          fillOpacity: color === 'transparent' ? 0 : 1,
          path: {
            fill: color
          }
        }}
      />
      {' '}
      <Text ml={!reverse_ ? 2 : 0} mr={reverse_ ? 2 : 0} sx={{ flex: 1, color }}>{children}</Text>
    </Flex>
  )
}

IconText.propTypes = iconTextProps

IconText.defaultProps = {
  reverse: false
}

export default IconText
