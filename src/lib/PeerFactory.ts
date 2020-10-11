import Peer from 'peerjs'
import { FakePeer } from './fake/FakePeer'

export const PeerFactory: { peers: Peer[], useFake: boolean, make: (id?: string) => Peer | FakePeer } = {
  peers: [],
  useFake: false,
  make (id?: string): Peer {
    const r = PeerFactory.peers.shift()
    if (r !== undefined) {
      return r
    } else if (!PeerFactory.useFake) {
      if (process.env.REACT_APP_PEER_HOST === undefined) {
        return new Peer(id)
      } else {
        return new Peer(id, {
          host: process.env.REACT_APP_PEER_HOST ?? 'localhost',
          port: Number.parseInt(process.env.REACT_APP_PEER_PORT ?? '9000'),
          path: process.env.REACT_APP_PEER_PATH ?? '/peer',
          secure: process.env.REACT_APP_PEER_SECURE === 'true'
        })
      }
    } else {
      return new FakePeer(id)
    }
  }
}
