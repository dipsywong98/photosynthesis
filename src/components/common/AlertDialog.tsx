import React, {FunctionComponent} from 'react'
import ConfirmDialog from './ConfirmDialog'
import PropTypes from 'prop-types'

const propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func,
  contentLabel: PropTypes.string,
  setIsOpen: PropTypes.func,
  yesText: PropTypes.string,
  children: PropTypes.node.isRequired,
  title: PropTypes.string,
  size: PropTypes.number,
}

const AlertDialog: FunctionComponent<PropTypes.InferProps<typeof propTypes>> = props => (
  <ConfirmDialog {...props} hideNoChoice>{props.children}</ConfirmDialog>
)
AlertDialog.propTypes = propTypes

AlertDialog.defaultProps = {
  title: 'Alert',
  yesText: 'OK'
}

export default AlertDialog
