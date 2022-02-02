import React, { FunctionComponent } from 'react'
import PropTypes, { InferProps } from 'prop-types'
import { Box, BoxOwnProps } from 'theme-ui'
import { IMAGE_SIZE_CSS } from '../../3d/constants'

const propTypes = {
  disabled: PropTypes.bool,
  onClick: PropTypes.func,
  path: PropTypes.string.isRequired,
  children: PropTypes.node,
  sx: PropTypes.object
}

export const Image: FunctionComponent<InferProps<typeof propTypes & BoxOwnProps>> = ({ disabled, onClick, path, children, sx }) => {
  return (
    <Box
      onClick={() => { onClick?.() }}
      sx={{
        width: IMAGE_SIZE_CSS,
        height: IMAGE_SIZE_CSS,
        backgroundImage: `url(${path})`,
        backgroundSize: 'auto 100%',
        textAlign: 'center',
        lineHeight: IMAGE_SIZE_CSS,
        color: 'white.0',
        boxShadow: 1,
        borderRadius: '50%',
        ...sx
      }}>
      <Box
        sx={{
          width: '100%',
          height: '100%',
          borderRadius: '50%',
          ':hover': disabled !== true
            ? {
                backgroundColor: 'highlight',
                cursor: (onClick !== undefined ? 'pointer' : undefined)
              }
            : undefined,
          backgroundColor: disabled === true ? 'muted' : undefined
        }}>
        {
          children
        }
      </Box>
    </Box>
  )
}

Image.propTypes = propTypes
