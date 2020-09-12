import Peer from 'peerjs'
import { PeerFactory } from './lib/PeerFactory'

const main = (): void => {
  console.log('init test')
  const peer1: Peer = PeerFactory.make()
  const peer2: Peer = PeerFactory.make()
  let count = 0
  peer1.on('open', () => {
    if (++count === 2) cb()
  })
  peer2.on('open', () => {
    if (++count === 2) cb()
  })
  const cb = (): void => {
    peer2.on('connection', (conn) => {
      console.log('on conn')
      conn.on('close', () => console.log('close 2 -> 1'))
      conn.on('open', () => {
        console.log('open')
        conn.close()
      })
    })
    const conn = peer1.connect(peer2.id)
    conn.on('close', () => console.log('close 1 -> 2'))
    const listener = (): void => {
      console.log('done')
    }
    conn.on('open', listener)
    conn.send('hiii')
  }
}

export default main
