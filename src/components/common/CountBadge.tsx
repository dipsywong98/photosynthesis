import React, { FunctionComponent } from 'react'
import PropTypes, { InferProps } from 'prop-types'
import { Badge } from '@theme-ui/components'

const propTypes = {
  count: PropTypes.number.isRequired,
  sx: PropTypes.object
}

export const CountBadge: FunctionComponent<InferProps<typeof propTypes>> = ({ count, sx }) => {
  return (
    <Badge
      variant={count > 0 ? 'primary' : 'danger'}
      sx={sx}>
      {count}
    </Badge>
  )
}

CountBadge.propTypes = propTypes
