import React, { FC } from 'react'
import sun from '!file-loader!../assets/images/sun.svg'
import { Box, SxProp } from 'theme-ui'
import { Theme } from '@theme-ui/css'

interface SunlightBadgeProps extends SxProp {
  size?: number | string
  myPoints: number
  className?: string
}

export const SunlightBadge: FC<SunlightBadgeProps> = ({ children, size = '24px', myPoints, className }) => {
  return (
    <Box
      className={className}
      sx={{
        boxSizing: 'content-box',
        backgroundImage: `url(${sun})`,
        backgroundSize: 'auto 100%',
        textAlign: 'center',
        width: size,
        height: size,
        lineHeight: size,
        color: (myPoints ?? Infinity) >= (children ?? -Infinity) ? 'white.0' : 'red.0',
        textShadow: (theme: Theme) => `
            -1px -1px 1px ${theme.colors?.sunTagShadow as string},
            1px -1px 1px ${theme.colors?.sunTagShadow as string},
            -1px 1px 1px ${theme.colors?.sunTagShadow as string},
            1px 1px 1px ${theme.colors?.sunTagShadow as string}`,
        fontSize: 1,
        fontWeight: 'bolder'
      }}>
      {children}
    </Box>
  )
}
