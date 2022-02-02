import React, { FunctionComponent } from 'react'
import PropTypes, { InferProps } from 'prop-types'
import { Box } from 'theme-ui'
import { SLOW, transition } from '../../theme/transitions'

const DEPTH = 6

const tokenProps = {
  url: PropTypes.string.isRequired,
  isActive: PropTypes.bool,
  size: PropTypes.number.isRequired
}

const Token: FunctionComponent<InferProps<typeof tokenProps>> = ({ url, isActive = false, size }) => (
  <Box
    className={isActive === true ? 'isActive' : undefined}
    sx={{
      position: 'relative',
      width: `${size}px`,
      height: `${size}px`,
      transformOrigin: '50% 0',
      ...transition(SLOW, ['transform']),
      ':hover, &.isActive': {
        '&': {
          transform: 'rotateX(30deg)'
        },
        '.depth': {
          transform: 'translateY(0px)'
        },
        '.gloss': {
          backgroundPosition: '0 0'
        }
      }
    }}>
    <Box
      className='depthContainer'
      sx={{
        position: 'absolute',
        overflow: 'hidden',
        top: '50%',
        height: `${size / 2 + DEPTH}px`,
        left: 0,
        right: 0
      }}>
      <Box
        className='depth'
        sx={{
          left: 0,
          right: 0,
          height: '100%',
          transform: `translateY(${-DEPTH}px)`,
          backgroundImage: 'linear-gradient(to right, #FFD784 0%, #6A5643 3%, #6A5643 97%, #FFD784 100%)',
          borderBottomLeftRadius: `${size}px`,
          borderBottomRightRadius: `${size}px`,
          ...transition(SLOW, ['transform'])
        }}
      />
    </Box>
    <Box
      sx={{
        position: 'absolute',
        left: 0,
        right: 0,
        top: 0,
        bottom: 0,
        backgroundImage: `url(${url})`,
        backgroundColor: '#E1B774',
        backgroundSize: 'cover',
        borderRadius: '100%',
        boxShadow: 'inset 0 2px 3px rgba(255, 255, 255, 0.5), inset 0 -2px 3px rgba(0, 0, 0, 0.3)'
      }}>
      <Box
        className='gloss'
        sx={{
          ...transition(SLOW, ['background-position']),
          position: 'absolute',
          left: 0,
          right: 0,
          top: 0,
          bottom: 0,
          borderRadius: '100%',
          backgroundImage: 'linear-gradient(to bottom, rgba(255,255,255,0.4) 0%, rgba(255,255,255,0) 50%)',
          backgroundRepeat: 'repeat-x',
          backgroundSize: '200% 200%',
          backgroundPosition: '0 100%'
        }}
      />
    </Box>
  </Box>
)

Token.propTypes = tokenProps

export default Token
