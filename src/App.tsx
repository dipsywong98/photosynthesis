import React, {useEffect} from 'react'
import logo from './logo.svg'
import './App.css'
import {ConnectionManager} from './lib/ConnectionManager'
import {ConnEvent} from './lib/ConnectionTypes'

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
global.ConnectionEvent = ConnEvent
const main = async () => {
  const c1 = ConnectionManager.withPrefix('1')
  const c2 = ConnectionManager.withPrefix('2')

// @ts-ignore
  global.c1 = c1
// @ts-ignore
  global.c2 = c2
  await c1.until(ConnEvent.PEER_OPEN, 2000)
  await c2.until(ConnEvent.PEER_OPEN, 2000)
  c1.on(ConnEvent.PEER_ERROR, console.log)
  c1.on(ConnEvent.CONN_DATA, (data) => console.log('data!!!', data))
  c1.on(ConnEvent.CONN_ERROR, console.log)
  c2.on(ConnEvent.CONN_DATA, (data) => console.log('data!!!', data))
  c2.on(ConnEvent.PEER_ERROR, console.log)
  c2.on(ConnEvent.CONN_ERROR, console.log)
  c1.onPkg('alert', ({data}) => window.alert(data))
  c2.onPkg('alert', ({data}) => window.alert(data))
  const p1 = c1.connect(ConnectionManager.prefixId('2')).then(() => {
    c1.broadcast('hello world')

    c1.sendPkg(c2.id, 'alert', 'hello world')
    c2.untilPkg('xd').then(console.log)
    c1.sendPkg(c2.id, 'xd', 'yoo')
  }).catch(e => console.log('err', e))
  // const p2 = c2.connect(ConnectionManager.prefixId('2')).then(() => {
  //   c2.broadcast('hello world')
  //
  //   c2.sendPkg(c1.id, 'alert', 'hello world')
  // }).catch(e => console.log('err', e))
  // c1.once(ConnectionEvent.CONN_OPEN, () => {
  // })

  console.log('hi')
  await p1
  // await p2
  console.log('h2')
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
