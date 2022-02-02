import React, { FunctionComponent } from 'react'
import { Box } from 'theme-ui'
import PropTypes, { InferProps } from 'prop-types'

const propTypes = {
  sx: PropTypes.object
}

export const Card: FunctionComponent<InferProps<typeof propTypes>> = (props) => (
  <Box
    {...props}
    sx={{
      py: 4, px: 5, backgroundColor: 'background', boxShadow: 2, borderRadius: 3, ...props.sx
    }}
  />
)

Card.propTypes = propTypes
