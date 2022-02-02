import React, { forwardRef } from 'react'
import { Box } from 'theme-ui'

const MenuItem = (props, ref) => (
  <Box variant='menuItem' ref={ref} {...props}/>
)

export default forwardRef(MenuItem)
