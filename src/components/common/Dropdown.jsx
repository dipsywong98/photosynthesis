/** @jsx jsx */
import { jsx } from 'theme-ui'
import { mdiChevronDown, mdiChevronUp } from '@mdi/js'
import { Box, Divider, Flex } from '@theme-ui/components'
import PropTypes from 'prop-types'
import { Children, useEffect, useRef, useState } from 'react'
import Button from './Button'
import Icon from './Icon'

const Dropdown = props => {
  const { children, title, onSelect, onToggle } = props
  const [isOpen, setOpen] = useState(false)
  /**
   * @type {React.MutableRefObject<Node>}
   */
  const ref = useRef(null)

  useEffect(() => {
    const close = (e) => {
      if (!ref.current.contains(e.target)) {
        setOpen(false)
      }
    }

    if (window) {
      window.addEventListener('click', close)
      return () => window.removeEventListener('click', close)
    }

    return () => {}
  }, [])

  useEffect(() => {
    onToggle && onToggle(isOpen)
  }, [isOpen, onToggle])

  return (
    <Flex
      {...props}
      ref={ref}
      sx={{
        position: 'relative',
        userSelect: 'none',
        width: props.fullwidth ? '100%' : undefined
      }}>
      <Button
        className={isOpen ? 'focus ' : ''}
        justifyContent='space-between'
        onClick={() => setOpen(!isOpen)}
        variant={isOpen ? 'active' : 'normal'}
        type={'button'}
        sx={{
          position: 'relative',
          justifyContent: 'space-between',
          flex: 1
        }}>
        {title}
        <Icon
          path={isOpen ? mdiChevronUp : mdiChevronDown}
          sx={{
            ml: 2,
            mr: -1
          }}
        />
      </Button>
      {isOpen && (
        <Box
          sx={{
            variant: 'dropdown',
            position: 'absolute',
            top: '100%',
            left: 0,
            mt: 1,
            minWidth: '100%',
            p: 0,
            zIndex: 50
          }}
          onClick={() => setOpen(false)}>
          {
            Children.toArray(children).filter(x => x !== null).map((child, i) =>
              typeof child === 'string' || typeof child === 'number' || (typeof child === 'object' && child.type !== Divider)
                ? <Box key={i} onClick={() => onSelect && onSelect(child)}>{child}</Box>
                : child
            )
          }
        </Box>
      )}
    </Flex>
  )
}

Dropdown.propTypes = {
  fullwidth: PropTypes.bool,
  children: PropTypes.node,
  title: PropTypes.string.isRequired,
  onSelect: PropTypes.func,
  onToggle: PropTypes.func
}

export default Dropdown
