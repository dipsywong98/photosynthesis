import React, { forwardRef, FunctionComponent } from 'react'
import { Box, BoxOwnProps } from '@theme-ui/components'

const Well: FunctionComponent<BoxOwnProps> = forwardRef<HTMLDivElement, BoxOwnProps>((props, ref) => (
  <Box
    ref={ref}
    // eslint-disable-next-line @typescript-eslint/ban-ts-ignore
    // @ts-expect-error
    __themeKey='wells'
    variant='normal'
    {...props}
  />
))

Well.displayName = 'Well'

export default Well
