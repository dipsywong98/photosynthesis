import {DataConnection} from 'peerjs'

export class FakeConn implements DataConnection{
  bufferSize: any
  dataChannel: any
  label: string = 'my label'
  metadata: any
  open: boolean = true
  peer: string = 'peer'
  peerConnection: any
  reliable: boolean = true
  serialization: string = 'binary'
  type: string = 'data'

  parse(): any {
  }

  stringify(data: any): string {
    return data.toString();
  }

  close(): void {
    this.open = false
  }

  off(event: string, fn: Function, once?: boolean): void {
  }

  public callbacks: Record<string | "data" | "open" | "close" | "error", Function[]> = {}

  on(event: string, cb: () => void): void
  on(event: "data", cb: (data: any) => void): void
  on(event: "open", cb: () => void): void
  on(event: "close", cb: () => void): void
  on(event: "error", cb: (err: any) => void): void
  on(event: string | "data" | "open" | "close" | "error", cb: (() => void) | ((data: any) => void)): void {
    if(!(event in this.callbacks)){
      this.callbacks[event] = []
    }
    this.callbacks[event].push(cb)
  }
  public trigger(event: string | "data" | "open" | "close" | "error", data: any) {
    this.callbacks[event]?.forEach(cb => cb(data))
  }

  public sent: any[] = []
  send(data: any): void {
    this.sent.push(data)
  }
}
