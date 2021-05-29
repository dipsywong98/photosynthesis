import React, { VFC } from 'react'
import PropTypes, { InferProps } from 'prop-types'
import { Badge } from '@theme-ui/components'
import { ThemeDerivedStyles, ThemeUICSSObject } from '@theme-ui/css'

const propTypes = {
  count: PropTypes.number.isRequired,
  sx: PropTypes.object as PropTypes.Requireable<ThemeUICSSObject | ThemeDerivedStyles>
}

export const CountBadge: VFC<InferProps<typeof propTypes>> = ({ count, sx }) => {
  return (
    <Badge
      variant={count > 0 ? 'primary' : 'danger'}
      sx={sx ?? undefined}>
      {count}
    </Badge>
  )
}

CountBadge.propTypes = propTypes
