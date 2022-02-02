import React, { FunctionComponent } from 'react'
import PropTypes, { InferProps } from 'prop-types'
import { Box, Flex } from 'theme-ui'
import sun from '!file-loader!../assets/images/sun.svg'
import { ThemeDerivedStyles, ThemeUICSSObject } from '@theme-ui/css'

const propTypes = {
  children: PropTypes.node,
  sx: PropTypes.object as PropTypes.Requireable<ThemeUICSSObject | ThemeDerivedStyles>
}

export const SunlightTag: FunctionComponent<InferProps<typeof propTypes>> = ({ children, sx }) => {
  return (
    <Flex sx={sx ?? undefined}>
      <Box>
        <img alt='sun icon' style={{ maxHeight: '24px' }} src={sun}/>
      </Box>
      <Box sx={{ lineHeight: '24px' }}>
        {children}
      </Box>
    </Flex>
  )
}

SunlightTag.propTypes = propTypes
