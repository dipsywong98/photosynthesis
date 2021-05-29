import React, { VFC } from 'react'
import ReactDOM from 'react-dom'
import './index.css'
import App from './components/App'
import * as serviceWorker from './serviceWorker'
import { Global } from '@emotion/react'
import theme from './theme'
import { ThemeProvider } from '@theme-ui/core'
import { startLoad } from './3d/assets'
import { Theme } from '@theme-ui/css'
import { omit } from 'ramda'
import { ColorModeProvider } from '@theme-ui/color-modes'

const omitTheme = omit(['theme'])

const MyGlobal: VFC = () => (
  <Global
    styles={(theme: Theme) => ({
      body: omitTheme(theme.styles?.body),
      '*': omitTheme(theme.styles?.['*']),
      a: omitTheme(theme.styles?.a)
    })}
  />
)

ReactDOM.render(
  <React.StrictMode>
    <ThemeProvider theme={theme}>
      <MyGlobal/>
      <ColorModeProvider>
        <App/>
      </ColorModeProvider>
    </ThemeProvider>
  </React.StrictMode>,
  document.getElementById('root')
)

startLoad()

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister()
