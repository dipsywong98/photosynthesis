/** @jsxImportSource theme-ui */

import { useThemeUI, Box } from 'theme-ui'
import Modal from 'react-modal'
import PropTypes from 'prop-types'

import { shortTransition } from '../../theme/transitions'

const Dialog = props => {
  const { theme } = useThemeUI()

  return (
    <Modal
      ariaHideApp={false}
      isOpen={props.isOpen}
      onRequestClose={() => !props.isStatic && props.onClose()}
      contentLabel={props.contentLabel}
      style={{
        overlay: {
          backgroundColor: 'fgPales.0',
          zIndex: 200,
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          padding: theme.space[2],
          overflowY: 'auto'
        }
      }}
      sx={{
        minWidth: ['100%', '250px'],
        maxWidth: typeof props.size === 'number' && theme.breakpoints[props.size],
        outline: 'none',
        opacity: 0,
        margin: 'auto',
        fontFamily: 'body',
        lineHeight: 'body',
        ...shortTransition(['opacity']),
        '&.ReactModal__Content--after-open': {
          opacity: 1
        },
        '&.ReactModal__Content--before-close': {
          opacity: 0
        }
      }}>
      <Box
        {...props}
        sx={{
          backgroundColor: 'bgs.1',
          boxShadow: 2,
          borderRadius: 1
        }}
      />
    </Modal>
  )
}

Dialog.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func,
  contentLabel: PropTypes.string,
  setIsOpen: PropTypes.func,
  isStatic: PropTypes.bool,
  size: PropTypes.number
}

Dialog.defaultProps = {
  size: 0
}

export default Dialog
