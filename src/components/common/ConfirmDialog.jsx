import Dialog from './Dialog'
import { Box, Flex, Heading, Text } from 'theme-ui'
import Button from './Button'
import PropTypes from 'prop-types'
import { always } from 'ramda'

const ConfirmDialog = props => {
  const close = typeof props.onClose === 'function'
    ? props.onClose
    : always(undefined)
  const action = typeof props.onAction === 'function'
    ? props.onAction
    : always(undefined)
  const run = x => () => {
    close()
    action(x)
  }
  return (
    <Dialog
      isStatic
      {...{
        isOpen: props.isOpen,
        onClose: run(false),
        contentLabel: props.contentLabel,
        setIsOpen: props.setIsOpen,
        size: props.size
      }}>
      <Box p={[4, 3]} pb={2}>
        <Heading variant='subheading'>{props.title}</Heading>
        <Text>{props.children}</Text>
      </Box>
      <Flex
        p={[3, 2]}
        sx={{
          alignItems: 'center',
          justifyContent: 'flex-end'
        }}>
        {!props.hideNoChoice && <Button onClick={run(false)}>{props.noText}</Button>}
        <Button variant='primary' ml={2} onClick={run(true)}>{props.yesText}</Button>
      </Flex>
    </Dialog>
  )
}

ConfirmDialog.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func,
  onAction: PropTypes.func,
  contentLabel: PropTypes.string,
  setIsOpen: PropTypes.func,
  noText: PropTypes.string,
  yesText: PropTypes.string,
  children: PropTypes.node.isRequired,
  title: PropTypes.string,
  hideNoChoice: PropTypes.bool,
  size: PropTypes.number
}

ConfirmDialog.defaultProps = {
  noText: 'No',
  yesText: 'Yes',
  title: 'Confirm',
  hideNoChoice: false
}

export default ConfirmDialog
