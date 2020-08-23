import {Connection} from './Connection'
import {DataConnection} from 'peerjs'
import {ConnectionManager} from './ConnectionManager'

class FakeConn implements DataConnection{
  bufferSize: any
  dataChannel: any
  label: string = 'my label'
  metadata: any
  open: boolean = true

  parse(data: string): any {
  }

  peer: string = 'peer'
  peerConnection: any
  reliable: boolean = true
  serialization: string = 'binary '

  stringify(data: any): string {
    return data.toString();
  }

  type: string = 'data'

  close(): void {
  }

  off(event: string, fn: Function, once?: boolean): void {
  }

  on(event: string, cb: () => void): void
  on(event: "data", cb: (data: any) => void): void
  on(event: "open", cb: () => void): void
  on(event: "close", cb: () => void): void
  on(event: "error", cb: (err: any) => void): void
  on(event: string | "data" | "open" | "close" | "error", cb: (() => void) | ((data: any) => void)): void {
  }

  send(data: any): void {
  }
}

describe('Connection', () => {
  it('can be constructed', () => {
    const conn = new FakeConn()
    const manager = new ConnectionManager()
    const connection = new Connection(conn, manager)
    expect(connection).toBeTruthy()
  })
})
