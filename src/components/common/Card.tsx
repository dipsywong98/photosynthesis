import React, { FunctionComponent } from 'react'
import { Box } from '@theme-ui/components'

export const Card: FunctionComponent = (props) => (
  <Box
    sx={{
      py: 4, px: 5, backgroundColor: 'background', boxShadow: 2, borderRadius: 3
    }}
    {...props}
  />
)
