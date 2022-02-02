import React, { FunctionComponent, useEffect, useState } from 'react'
import PropTypes, { InferProps } from 'prop-types'
import { Box } from 'theme-ui'
import { Image } from './Image'
import { IMAGE_SIZE, IMAGE_SIZE_CSS } from '../../3d/constants'
import { SLOW, transition } from '../../theme/transitions'
import Hammer from 'react-hammerjs'
import { CountBadge } from './CountBadge'

const propTypes = {
  stack: PropTypes.arrayOf(PropTypes.node).isRequired,
  enabled: PropTypes.arrayOf(PropTypes.bool.isRequired),
  imgPath: PropTypes.string.isRequired,
  onClick: PropTypes.func,
  badge: PropTypes.number
}

export const ImageStack: FunctionComponent<InferProps<typeof propTypes>> = ({ stack, imgPath, badge, enabled, onClick }) => {
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
          <Box
            key={k}
            sx={{
              position: 'absolute',
              bottom: hovering ? `${k * (IMAGE_SIZE + 4)}px` : '0px',
              zIndex: stack.length - k,
              pb: '4px',
              ...transition(SLOW, ['bottom'])
            }}>
            <Image
              path={imgPath}
              disabled={content === '-' || enabled?.[k] === false}
              onClick={k === 0 && enabled?.[k] !== false ? onClick : undefined}>
              {
                // enabled?.[k] === false ? '-' : ''
              }
              {content}
            </Image>
          </Box>
        ))}
        {badge !== undefined && badge !== null && (
          <CountBadge
            count={badge}
            sx={{
              position: 'absolute',
              right: 0,
              bottom: 0,
              zIndex: stack.length + 1
            }}
          />)}
      </Box>
    </Hammer>
  )
}

ImageStack.propTypes = propTypes
