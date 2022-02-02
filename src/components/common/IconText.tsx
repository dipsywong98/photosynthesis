import React, { FunctionComponent } from 'react'
import { Flex, Text, FlexProps } from 'theme-ui'
import PropTypes, { InferProps } from 'prop-types'
import Icon from './Icon'

const iconTextProps = {
  path: PropTypes.string.isRequired,
  children: PropTypes.node.isRequired,
  size: PropTypes.oneOfType([
    PropTypes.arrayOf(PropTypes.oneOfType([
      PropTypes.number,
      PropTypes.string
    ])),
    PropTypes.number,
    PropTypes.string
  ]),
  color: PropTypes.any,
  reverse: PropTypes.bool,
  iconMargin: PropTypes.oneOfType([
    PropTypes.arrayOf(PropTypes.oneOfType([
      PropTypes.number,
      PropTypes.string
    ])),
    PropTypes.number,
    PropTypes.string
  ])
}

export interface IconTextProps extends InferProps<typeof iconTextProps> {
  color?: string | ((x: unknown) => string) | null
}

const IconText: FunctionComponent<IconTextProps & FlexProps> = ({
  children,
  color,
  path,
  size,
  reverse = false,
  iconMargin = 2,
  ...otherProps
}) => {
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
      <Text
        sx={{
          flex: 1,
          color,
          fontSize: size,
          [reverse_ ? 'mr' : 'ml']: iconMargin
        }}>
        {children}
      </Text>
    </Flex>
  )
}

IconText.propTypes = iconTextProps

IconText.defaultProps = {
  reverse: false
}

export default IconText
