import React, { FunctionComponent, useEffect, useState } from 'react'
import PropTypes, { InferProps } from 'prop-types'
import { Badge, Box } from '@theme-ui/components'
import { Image } from './Image'
import { IMAGE_SIZE, IMAGE_SIZE_CSS } from '../../3d/constants'
import { SLOW, transition } from '../../theme/transitions'
import Hammer from 'react-hammerjs'

const propTypes = {
  stack: PropTypes.arrayOf(PropTypes.node).isRequired,
  imgPath: PropTypes.string.isRequired,
  onClick: PropTypes.func,
  badge: PropTypes.node
}

export const ImageStack: FunctionComponent<InferProps<typeof propTypes>> = ({ stack, imgPath, badge, onClick }) => {
  const [hovering, setHovering] = useState(false)
  useEffect(() => {
    const listener = (): void => setHovering(false)
    window.addEventListener('touchend', listener)
    window.addEventListener('touchcancel', listener)
    return () => {
      window.removeEventListener('touchend', listener)
      window.removeEventListener('touchcancel', listener)
    }
  }, [setHovering])
  return (
    <Hammer
      onTap={(e: HammerInput) => {
        e.preventDefault()
        onClick?.()
        setHovering(false)
      }}
      onPress={(e: HammerInput) => {
        e.preventDefault()
        setHovering(true)
      }}
      onPressUp={(e: HammerInput) => {
        setHovering(false)
        e.preventDefault()
      }}>
      <Box
        onMouseEnter={() => setHovering(true)}
        onMouseLeave={() => setHovering(false)}
        unselectable={'on'}
        sx={{ position: 'relative', width: IMAGE_SIZE_CSS, height: IMAGE_SIZE_CSS }}
        onContextMenu={e => {
          setHovering(false)
          e.preventDefault()
        }}
        m={1}>
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
            {content === '-' ? <Box
              sx={{
                backgroundColor: 'muted',
                width: '100%',
                height: '100%',
                borderRadius: '50%'
              }}>
              -
            </Box> : <Box
              sx={{
                width: '100%',
                height: '100%',
                borderRadius: '50%',
                ':hover': {
                  backgroundColor: 'highlight',
                  cursor: (onClick !== undefined && k === 0 ? 'pointer' : undefined)
                }
              }}>{content}</Box>}
          </Image>))}
        {badge !== undefined && <Badge
          variant='circle'
          sx={{
            position: 'absolute',
            right: 0,
            bottom: 0,
            zIndex: stack.length + 1
          }}>
          {badge}
        </Badge>}
      </Box>
    </Hammer>
  )
}

ImageStack.propTypes = propTypes
