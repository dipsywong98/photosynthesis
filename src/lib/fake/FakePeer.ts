import Peer from 'peerjs'
import { FakeConn } from './FakeConn'
import { FakeMediaConnection } from './FakeMediaConnection'
import { v4 as uuidv4 } from 'uuid'

class FakePeer implements Peer {
  connections: FakeConn[] = []
  destroyed = false
  disconnected = false
  id = 'some id'
  prototype: any = null

  constructor (id?: string) {
    this.id = id ?? uuidv4()
  }

  call (id: string, stream: MediaStream, options?: Peer.CallOption): Peer.MediaConnection {
    return new FakeMediaConnection()
  }

  connect (id: string, options?: Peer.PeerConnectOption): Peer.DataConnection {
    const fakeConn = new FakeConn()
    fakeConn.peer = this.id
    return fakeConn
  }

  destroy (): void {
    this.destroyed = true
  }

  disconnect (): void {
    this.disconnected = true
  }

  getConnection (peerId: string, connectionId: string): Peer.MediaConnection | Peer.DataConnection | null {
    return this.connections.find(({ peer }) => peer === peerId) ?? null
  }

  listAllPeers (callback: (peerIds: string[]) => void): void {
  }

  off (event: string, fn: Function, once?: boolean): void {
    return
  }

  public callbacks: Record<string | 'data' | 'open' | 'close' | 'error', Function[]> = {}
  on (event: string, cb: () => void): void
  on (event: 'open', cb: (id: string) => void): void
  on (event: 'connection', cb: (dataConnection: Peer.DataConnection) => void): void
  on (event: 'call', cb: (mediaConnection: Peer.MediaConnection) => void): void
  on (event: 'close', cb: () => void): void
  on (event: 'disconnected', cb: () => void): void
  on (event: 'error', cb: (err: any) => void): void
  on (event: string | 'open' | 'connection' | 'call' | 'close' | 'disconnected' | 'error', cb: (() => void) | ((id: string) => void) | ((dataConnection: Peer.DataConnection) => void) | ((mediaConnection: Peer.MediaConnection) => void) | ((err: any) => void)): void {
    if (!(event in this.callbacks)) {
      this.callbacks[event] = []
    }
    this.callbacks[event].push(cb)
  }

  public trigger (event: string | 'data' | 'open' | 'close' | 'error', data: any): void {
    this.callbacks[event]?.forEach(cb => cb(data))
  }

  reconnect (): void {
    return
  }
}
