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

export const ImageStack: FunctionComponent<InferProps<typeof propTypes>> = ({ stack, imgPath, badge, onClick }) => {
  const [hovering, setHovering] = useState(false)
  return (
    <Box
      m={1}
      unselectable={'on'}
      sx={{ position: 'relative', width: IMAGE_SIZE_CSS, height: IMAGE_SIZE_CSS }}
      onClick={() => { onClick?.() }}
      onTouchStart={() => setHovering(true)}
      onMouseEnter={() => setHovering(true)}
      onTouchEnd={() => setHovering(false)}
      onMouseLeave={() => setHovering(false)}>
      {(stack.length > 0 ? stack : ['-']).map((content, k) => (
        <Image
          key={k}
          path={imgPath}
          sx={{
            boxShadow: 1,
            borderRadius: '50%',
            position: 'absolute',
            bottom: hovering ? `${k * (IMAGE_SIZE + 4)}px` : '0px',
            zIndex: stack.length - k,
            ...transition(SLOW, ['bottom'])
          }}>
          {content === '-' ? <Box sx={{ backgroundColor: 'muted', width: '100%', height: '100%', borderRadius: '50%' }}> - </Box> : content}
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

ImageStack.propTypes = propTypes
