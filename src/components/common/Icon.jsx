/** @jsx jsx */
import { jsx } from 'theme-ui'
import MdiIcon from '@mdi/react'
import PropTypes from 'prop-types'

const Icon = (props) => {
  const fontSizes = Array.isArray(props.size) ? props.size : [props.size]
  const sizes = fontSizes.map(x => theme => theme.fontSizes[x] * theme.lineHeights.body)

  return (
    <MdiIcon
      {...{ ...props, color: null, size: null }}
      sx={{
        fill: props.color,
        height: sizes,
        width: sizes,
        ...props?.sx
      }}
    />
  )
}

Icon.propTypes = {
  path: PropTypes.string.isRequired,
  color: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.func
  ]),
  size: PropTypes.oneOfType([
    PropTypes.number,
    PropTypes.arrayOf(PropTypes.number)
  ])
}

Icon.defaultProps = {
  color: 'text',
  size: 1
}

export default Icon
