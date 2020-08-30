import Peer from 'peerjs'

export const PeerFactory: { peers: Peer[], make: (id?: string) => Peer } = {
  peers: [],

  make (id?: string): Peer {
    const r = PeerFactory.peers.shift()
    if (r !== undefined) {
      return r
    } else {
      return new Peer(id, {
        host: 'localhost',
        port: 9000,
        path: '/peer'
      })
    }
  }
}
