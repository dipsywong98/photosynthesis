import Peer from 'peerjs'
import { FakePeer } from './fake/FakePeer'

export const PeerFactory: { peers: Peer[], useFake: boolean, make: (id?: string) => Peer|FakePeer } = {
  peers: [],
  useFake: false,
  make (id?: string): Peer {
    const r = PeerFactory.peers.shift()
    if (r !== undefined) {
      return r
    } else if (!PeerFactory.useFake) {
      return new Peer(id, {
        host: 'localhost',
        port: 9000,
        path: '/peer'
      })
    } else {
      return new FakePeer(id)
    }
  }
}
