import React, {FunctionComponent, useEffect, useRef, useState} from 'react'
import PropTypes, {InferProps} from 'prop-types'
import {Box, BoxProps} from '@theme-ui/components'
import {SLOW, transition} from '../../theme/transitions'

const OPEN = 0b001
const DURING = 0b010
const BEFORE = 0b100

const collapsibleProps = {
  isOpen: PropTypes.bool.isRequired,
  children: PropTypes.node.isRequired,
  hideOnly: PropTypes.bool,
  noInitialTransition: PropTypes.bool
}

export type CollapsibleProps = InferProps<typeof collapsibleProps>

const Collapsible: FunctionComponent<CollapsibleProps & BoxProps> = ({ isOpen, children, hideOnly, noInitialTransition, ...boxProps }) => {
  const ref = useRef<HTMLDivElement>(null)
  const [scrollHeight, setScrollHeight] = useState(0)
  const [isVisible, setVisible] = useState(isOpen)
  const [transitionState, setTransitionState] = useState<number>(isOpen ? OPEN : 0)
  const [isMounted, setMounted] = useState(false)
  const [init, setInit] = useState(!(noInitialTransition ?? false))

  useEffect(() => {
    setTimeout(() => setInit(true), SLOW * 1000)
  }, [])

  const updateScrollHeight = (): void => {
    if (ref?.current !== null) {
      setScrollHeight(ref.current.scrollHeight)
    }
  }

  useEffect(() => {
    if (transitionState === 0 && isOpen) {
      setVisible(true)
    }
    setTransitionState(isOpen ? BEFORE | OPEN : BEFORE & ~OPEN)
  }, [isOpen])

  useEffect(() => {
    updateScrollHeight()
    if ((transitionState & BEFORE) > 0) {
      setTransitionState(transitionState & ~BEFORE | DURING)
    } else if ((transitionState & DURING) > 0) {
      setTimeout(() => {
        if (isMounted) {
          if (transitionState === (DURING & ~OPEN)) {
            setVisible(false)
          }
          setTransitionState(transitionState & ~DURING)
        }
      }, SLOW * 1000)
    }
  }, [transitionState])

  useEffect(() => {
    setMounted(true)
    return () => {
      setMounted(false)
    }
  }, [])

  const height = (transitionState === (DURING | OPEN)) || (transitionState === (BEFORE & ~OPEN))
    ? scrollHeight.toString() + 'px'
    : (transitionState === (BEFORE | OPEN)) || (transitionState === (DURING & ~OPEN))
      ? '0px'
      : undefined

  return (
    <Box
      ref={ref}
      sx={{
        height,
        overflowY: (transitionState & (DURING | BEFORE)) > 0 ? 'hidden' : undefined,
        ...(init ? transition(SLOW, ['height']) : {})
      }}
      {...boxProps}>
      {hideOnly ?? false
        ? (
          <Box sx={{ display: isVisible ? 'block' : 'none' }}>
            {children}
          </Box>
        )
        : (isVisible ? children : null)}
    </Box>
  )
}

Collapsible.propTypes = collapsibleProps

Collapsible.defaultProps = {
  noInitialTransition: false
}

export default Collapsible
