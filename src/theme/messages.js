const baseMessage = {
  borderRadius: 1
}

const messageStyle = (borderColor, fillColor) => ({
  ...baseMessage,
  borderColor: borderColor,
  color: fillColor,
  '*': {
    fill: fillColor
  }
})

export default {
  primary: messageStyle('blue.0', 'blue.1'),
  info: messageStyle('gray.0', 'gray.1'),
  danger: messageStyle('red.0', 'red.1'),
  warning: messageStyle('yellow.0', 'yellow.1'),
  success: messageStyle('green.0', 'green.1')
}
