/** @jsx jsx */
import { css, jsx, keyframes } from '@emotion/core'
import { Box } from '@theme-ui/components'
import { useThemeUI } from 'theme-ui'

const bounce = keyframes`
  0%{
    background-position: -468px 0;
  }
  100%{
    background-position: 468px 0;
  }
`

const Gradient = (props) => {
  const { theme } = useThemeUI()
  return (
    <Box
      sx={css`
      border-radius: ${theme.space[1]}px;
      flex: 1;
      height: 24px;
      background: #f6f7f8;
      background: linear-gradient(to right, ${theme.colors.bgs[2]} 8%, ${theme.colors.bgs[1]} 38%, ${theme.colors.bgs[2]} 54%);
      background-size: 1000px 640px;
      animation: ${bounce} 1s linear infinite;
    `}
      {...props}
    />
  )
}
export default Gradient
