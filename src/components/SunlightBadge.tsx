import React, { FunctionComponent } from 'react'
import PropTypes, { InferProps } from 'prop-types'
import sun from '../assets/images/sun.svg'
import { Box } from '@theme-ui/components'

const propTypes = {
  size: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
  children: PropTypes.number,
  sx: PropTypes.object,
  myPoints: PropTypes.number
}

export const SunlightBadge: FunctionComponent<InferProps<typeof propTypes>> = ({ children, size = '24px', sx, myPoints }) => {
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
        color: (myPoints ?? Infinity) >= (children ?? -Infinity) ? 'white.0' : 'red.0',
        textShadow: (theme: { colors: { sunTagShadow: string } }) => `
            -1px -1px 1px ${theme.colors.sunTagShadow},
            1px -1px 1px ${theme.colors.sunTagShadow},
            -1px 1px 1px ${theme.colors.sunTagShadow},
            1px 1px 1px ${theme.colors.sunTagShadow}`,
        fontSize: 1,
        fontWeight: 'bolder',
        ...sx
      }}>
      {children}
    </Box>
  )
}

SunlightBadge.propTypes = propTypes
