import MdiIcon from '@mdi/react'
import PropTypes from 'prop-types'

const Icon = (props) => {
  const { color, size, sx } = props
  const isInferringFontSize = (Array.isArray(size) && size.reduce((c, it) => c && typeof it === 'number', true)) || typeof size === 'number'
  const fontSizes = Array.isArray(size) ? size : typeof size === 'number' ? [size] : size
  const sizes = isInferringFontSize ? fontSizes.map(x => theme => theme.fontSizes[x] * theme.lineHeights.body) : fontSizes

  return (
    <MdiIcon
      {...{ ...props, color: null, size: null }}
      sx={{
        fill: color,
        height: sizes,
        width: sizes,
        ...sx
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
    PropTypes.string,
    PropTypes.arrayOf(PropTypes.oneOfType([
      PropTypes.number,
      PropTypes.string
    ]))
  ]),
  sx: PropTypes.object
}

Icon.defaultProps = {
  color: 'text',
  size: 1
}

export default Icon
