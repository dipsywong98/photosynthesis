import React, { FunctionComponent } from 'react'
import ReactDOM from 'react-dom'
import './index.css'
import App from './components/App'
import * as serviceWorker from './serviceWorker'
import { Global } from '@emotion/core'
import theme from './theme'
import { ThemeProvider } from 'theme-ui'
import { startLoad } from './3d/assets'

const MyGlobal: FunctionComponent = () => (
  <Global
    styles={(theme) => ({
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access,@typescript-eslint/no-unsafe-assignment
      body: theme.styles.body,
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access,@typescript-eslint/no-unsafe-assignment
      '*': theme.styles['*'],
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access,@typescript-eslint/no-unsafe-assignment
      a: theme.styles.a
    })}
  />
)

ReactDOM.render(
  <React.StrictMode>
    <ThemeProvider theme={theme}>
      <MyGlobal/>
      <App/>
    </ThemeProvider>
  </React.StrictMode>,
  document.getElementById('root')
)

startLoad()

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister()
