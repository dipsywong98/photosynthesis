import React, { FunctionComponent, useState } from 'react'
import PropTypes, { InferProps } from 'prop-types'
import { Badge, Box } from '@theme-ui/components'
import token1 from '../assets/images/token1.png'
import token2 from '../assets/images/token2.png'
import token3 from '../assets/images/token3.png'
import token4 from '../assets/images/token4.png'
import { Image } from './common/Image'
import { IMAGE_SIZE, IMAGE_SIZE_CSS } from '../3d/constants'
import { SLOW, transition } from '../theme/transitions'

const tokenImages = ['', token1, token2, token3, token4]

const propTypes = {
  stack: PropTypes.arrayOf(PropTypes.number).isRequired,
  leaves: PropTypes.number.isRequired
}

export const TokenStack: FunctionComponent<InferProps<typeof propTypes>> = ({ stack, leaves }) => {
  const [hovering, setHovering] = useState(false)
  return (
    <Box
      sx={{ position: 'relative', width: IMAGE_SIZE_CSS, height: IMAGE_SIZE_CSS }}
      onTouchStart={() => setHovering(true)}
      onMouseEnter={() => setHovering(true)}
      onTouchEnd={() => setHovering(false)}
      onMouseLeave={() => setHovering(false)}>
      <Image path={tokenImages[leaves]} sx={{ position: 'absolute', zIndex: stack.length + 1 }}>
        {
          stack.length === 0 ? '-' : stack[0]
        }
      </Image>
      {stack.slice(1).map((score, k) => (
        <Image
          key={k}
          path={tokenImages[leaves]}
          sx={{
            position: 'absolute',
            bottom: hovering ? `${(k + 1) * IMAGE_SIZE}px` : '0px',
            zIndex: stack.length - k,
            ...transition(SLOW, ['bottom'])
          }}>
          {score}
        </Image>))}
      <Badge
        variant='circle'
        sx={{
          position: 'absolute', right: 0, bottom: 0, zIndex: stack.length + 1
        }}>
        {stack.length}
      </Badge>
    </Box>
  )
}

TokenStack.propTypes = propTypes
