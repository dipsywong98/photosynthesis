import Peer, { DataConnection, MediaConnection } from 'peerjs'

export class FakeMediaConnection implements MediaConnection {
  bufferSize: any
  dataChannel: any
  label = 'my label'
  metadata: any
  open = true
  peer = 'peer'
  peerConnection: any
  reliable = true
  serialization = 'binary'
  type = 'data'

  parse (): any {
  }

  stringify (data: any): string {
    return data.toString()
  }

  close (): void {
    this.open = false
  }

  off (event: string, fn: Function, once?: boolean): void {
  }

  public callbacks: Record<string | 'data' | 'open' | 'close' | 'error', Function[]> = {}

  // on (event: string, cb: () => void): void
  // on (event: 'data', cb: (data: any) => void): void
  // on (event: 'open', cb: () => void): void
  // on (event: 'close', cb: () => void): void
  // on (event: 'error', cb: (err: any) => void): void
  // on (event: string | 'data' | 'open' | 'close' | 'error', cb: (() => void) | ((data: any) => void)): void {
  //   if (!(event in this.callbacks)) {
  //     this.callbacks[event] = []
  //   }
  //   this.callbacks[event].push(cb)
  // }

  public trigger (event: string | 'data' | 'open' | 'close' | 'error', data: any) {
    this.callbacks[event]?.forEach(cb => cb(data))
  }

  public sent: any[] = []

  send (data: any): void {
    this.sent.push(data)
  }

  answer (stream?: MediaStream, options?: Peer.AnswerOption): void {
  }

  on (event: string, cb: () => void): void
  on (event: 'stream', cb: (stream: MediaStream) => void): void
  on (event: 'close', cb: () => void): void
  on (event: 'error', cb: (err: any) => void): void
  on (event: string | 'stream' | 'close' | 'error', cb: (() => void) | ((stream: MediaStream) => void) | ((err: any) => void)): void {
    if (!(event in this.callbacks)) {
      this.callbacks[event] = []
    }
    this.callbacks[event].push(cb)
  }
}
