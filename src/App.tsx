import React, {useEffect} from 'react'
import logo from './logo.svg'
import './App.css'
import {ConnectionManager} from './lib/ConnectionManager'
import {ConnectionEvent} from './lib/ConnectionTypes'

// const peer = new Peer('wgyp9qrark000000', {
//   secure: true
// })
// const peer2 = new Peer('wgyp9qrark000001', {
//   secure: true
// })
// console.log(peer)
// peer.on('open', id => {
//   console.log('opened', id)
//   peer.connect('abdddsss.2')
// })
// peer2.on('open', id => {
//   console.log('opened', id)
//   peer.connect('abdddsss.2')
// })
// peer.on('error', console.log)
// @ts-ignore
global.Connection = ConnectionManager
// @ts-ignore
global.ConnectionEvent = ConnectionEvent
const main = async () => {
  const c1 = ConnectionManager.withPrefix('1')
  const c2 = ConnectionManager.withPrefix('2')

// @ts-ignore
  global.c1 = c1
// @ts-ignore
  global.c2 = c2
  await c1.until(ConnectionEvent.PEER_OPEN, 2000)
  await c2.until(ConnectionEvent.PEER_OPEN, 2000)
  c1.on(ConnectionEvent.PEER_ERROR, console.log)
  c1.on(ConnectionEvent.CONN_DATA, (data) => console.log('data!!!', data))
  c1.on(ConnectionEvent.CONN_ERROR, console.log)
  c2.on(ConnectionEvent.CONN_DATA, (data) => console.log('data!!!', data))
  c2.on(ConnectionEvent.PEER_ERROR, console.log)
  c2.on(ConnectionEvent.CONN_ERROR, console.log)
  c1.connect(ConnectionManager.prefixId('2')).then(() => {
    c1.broadcast('hello world')
  }).catch(e => console.log('err', e))
  // c1.once(ConnectionEvent.CONN_OPEN, () => {
  // })

  console.log('hi')
}
main()

function App() {
  useEffect(() => {
  }, [])
  return (
    <div className="App">
      <header className="App-header">
        <img src={logo} className="App-logo" alt="logo"/>
        <p>
          Edit <code>src/App.tsx</code> and save to reload.
        </p>
        <a
          className="App-link"
          href="https://reactjs.org"
          target="_blank"
          rel="noopener noreferrer"
        >
          Learn React
        </a>
      </header>
    </div>
  )
}

export default App
