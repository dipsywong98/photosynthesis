import React, { FunctionComponent } from 'react'
import PropTypes, { InferProps } from 'prop-types'
import { Box, BoxOwnProps } from '@theme-ui/components'
import { IMAGE_SIZE_CSS } from '../../3d/constants'

const propTypes = {
  path: PropTypes.string.isRequired,
  children: PropTypes.node,
  sx: PropTypes.object
}

export const Image: FunctionComponent<InferProps<typeof propTypes & BoxOwnProps>> = ({ path, children, sx }) => {
  return (
    <Box
      sx={{
        width: IMAGE_SIZE_CSS,
        height: IMAGE_SIZE_CSS,
        backgroundImage: `url(${path})`,
        backgroundSize: 'auto 100%',
        textAlign: 'center',
        lineHeight: IMAGE_SIZE_CSS,
        color: 'white.0',
        ...sx
      }}>
      {
        children
      }
    </Box>
  )
}

Image.propTypes = propTypes
