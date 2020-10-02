import React, { FunctionComponent } from 'react'
import PropTypes, { InferProps } from 'prop-types'
import sun from '../assets/images/sun.svg'
import { Box } from '@theme-ui/components'

const propTypes = {
  size: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
  children: PropTypes.node,
  sx: PropTypes.object
}

export const SunlightBadge: FunctionComponent<InferProps<typeof propTypes>> = ({ children, size = '24px', sx }) => {
  return (
    <Box
      sx={{
        boxSizing: 'content-box',
        backgroundImage: `url(${sun})`,
        backgroundSize: 'auto 100%',
        textAlign: 'center',
        width: size,
        height: size,
        lineHeight: size,
        // color: 'sunTagShadow',
        textShadow: (theme: { colors: { sunTagShadow: string } }) => `
            -1px -1px 1px ${theme.colors.sunTagShadow},
            1px -1px 1px ${theme.colors.sunTagShadow},
            -1px 1px 1px ${theme.colors.sunTagShadow},
            1px 1px 1px ${theme.colors.sunTagShadow}`,
        fontSize: 1,
        ...sx
      }}>
      {children}
    </Box>
  )
}

SunlightBadge.propTypes = propTypes
