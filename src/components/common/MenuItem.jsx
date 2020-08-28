import React, { forwardRef } from 'react'
import { Box } from '@theme-ui/components'

const MenuItem = (props, ref) => (
  <Box variant='menuItem' ref={ref} {...props}/>
)

export default forwardRef(MenuItem)
