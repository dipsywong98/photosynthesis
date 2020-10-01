import React, { FunctionComponent } from 'react'
import PropTypes, { InferProps } from 'prop-types'
import { Box, Flex } from '@theme-ui/components'
import sun from '../assets/images/sun.svg'

const propTypes = {
  children: PropTypes.node,
  sx: PropTypes.object
}

export const SunlightTag: FunctionComponent<InferProps<typeof propTypes>> = ({ children, sx }) => {
  return (
    <Flex sx={sx}>
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
