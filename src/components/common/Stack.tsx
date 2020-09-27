import React, { FunctionComponent, useState } from 'react'
import PropTypes, { InferProps } from 'prop-types'
import { Badge, Box } from '@theme-ui/components'
import { Image } from './Image'
import { IMAGE_SIZE, IMAGE_SIZE_CSS } from '../../3d/constants'
import { SLOW, transition } from '../../theme/transitions'

const propTypes = {
  stack: PropTypes.arrayOf(PropTypes.node).isRequired,
  imgPath: PropTypes.string.isRequired,
  onClick: PropTypes.func,
  badge: PropTypes.node
}

export const Stack: FunctionComponent<InferProps<typeof propTypes>> = ({ stack, imgPath, badge, onClick }) => {
  const [hovering, setHovering] = useState(false)
  return (
    <Box
      unselectable={'on'}
      sx={{ position: 'relative', width: IMAGE_SIZE_CSS, height: IMAGE_SIZE_CSS }}
      onClick={() => { onClick?.() }}
      onTouchStart={() => setHovering(true)}
      onMouseEnter={() => setHovering(true)}
      onTouchEnd={() => setHovering(false)}
      onMouseLeave={() => setHovering(false)}>
      {stack.map((score, k) => (
        <Image
          key={k}
          path={imgPath}
          sx={{
            position: 'absolute',
            bottom: hovering ? `${k * IMAGE_SIZE}px` : '0px',
            zIndex: stack.length - k,
            ...transition(SLOW, ['bottom'])
          }}>
          {score}
        </Image>))}
      {badge !== undefined && <Badge
        variant='circle'
        sx={{
          position: 'absolute', right: 0, bottom: 0, zIndex: stack.length + 1
        }}>
        {badge}
      </Badge>}
    </Box>
  )
}

Stack.propTypes = propTypes
