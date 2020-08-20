import Peer, {DataConnection} from "peerjs"
import {Observable} from './Observable'
import {v4} from 'uuid'

export interface ConnectionError {
  name: string
  message: string
  stack?: string
  type?: string
}

export interface ConnectionListenerPayload {
  conn?: DataConnection
  data?: any
  error?: ConnectionError
  pid?: number
}
export type ConnectionListener = (...params: any[]) => void

export enum ConnectionEvent {
  PEER_OPEN= '_open',
  PEER_CLOSE = '_close',
  PEER_CONNECT = '_connect',
  PEER_DISCONNECT = '_disconnect',
  PEER_ERROR = '_error',
  CONN_OPEN = 'open',
  CONN_CLOSE = 'close',
  CONN_DATA = 'data',
  CONN_ERROR = 'error',
  CONN_ACK = 'ack'
}

export class Connection extends Observable {
  id?: string
  peer: Peer
  connections: DataConnection[] = []

  public static prefixId(id: string): string {
    return 'wgyp9qrark000000' + id
  }

  constructor(id?: string) {
    super()
    this.peer = this.initPeer(id)
  }

  public changeId(id?: string): void {
    this.peer.disconnect()
    this.peer = this.initPeer(id)
  }

  public async connect(id: string) {
    const conn = this.peer.connect(id)
    return new Promise((resolve, reject) => {
      const id2 = this.once(ConnectionEvent.PEER_ERROR, ({error}: ConnectionListenerPayload) => {
        reject(error)
      })
      conn.on('open', () => {
        this.connections.push(conn)
        this.enrichConn(conn)
        this.off(ConnectionEvent.CONN_ERROR, id2)
        resolve(conn)
      })
    })
  }

  public broadcast(data: any): Promise<unknown> {
    return Promise.all(this.connections.map(conn => {
      let pid = v4()
      conn.send([pid, data])
      return this.untilMatch(ConnectionEvent.CONN_ACK, pid)
    }))
  }

  private initPeer(id?: string): Peer {
    const connectionIds = this.connections.map(conn => conn.peer)
    this.connections = []
    const peer = new Peer(id, {
      secure: true
    })
    peer.on('open', this.onPeerOpenHandler(peer, connectionIds))
    peer.on('error', (error) => {
      this.emit(ConnectionEvent.PEER_ERROR, {error})
    })
    peer.on('close', () => {this.emit(ConnectionEvent.PEER_CLOSE, {})})
    peer.on('disconnected', () => {this.emit(ConnectionEvent.PEER_DISCONNECT, {})})

    return peer
  }

  private enrichConn(conn: DataConnection): DataConnection {
    conn.on('open', () => {
      this.emit(ConnectionEvent.CONN_OPEN, {conn})
    })
    conn.on('data', ([pid, data]) => {
      console.log(this.id, pid, data)
      if(data !== undefined){
        this.emit(ConnectionEvent.CONN_DATA, {conn, data})
        conn.send([pid])
      } else{
        this.emit(ConnectionEvent.CONN_ACK, pid)
      }
    })
    conn.on('error', (error) => {
      this.emit(ConnectionEvent.CONN_ERROR, {conn, error})
    })
    conn.on('close', () => {
      this.emit(ConnectionEvent.CONN_CLOSE, {conn})
      this.connections = this.connections.filter(c => c.peer !== conn.peer)
    })
    return conn
  }

  private onPeerOpenHandler = (peer: Peer, connectionIds: string[]) => (id: string): void => {
    this.id = id
    this.emit(ConnectionEvent.PEER_OPEN, {})
    peer.on('connection', this.onPeerConnectionHandler)
    connectionIds.forEach(id => {
      this.connections.push(this.peer.connect(id))
    })
  }

  private onPeerConnectionHandler = (conn: DataConnection) => {
    this.emit(ConnectionEvent.PEER_CONNECT, {conn})
    this.connections.push(conn)
    this.enrichConn(conn)
  }

  public on(event: ConnectionEvent, listener: ConnectionListener): string {
    return super.on(event, listener)
  }

  public once(event: ConnectionEvent, listener: ConnectionListener): string {
    return super.once(event, listener)
  }

  public until(event: ConnectionEvent, timeout: number = 500): Promise<any[]> {
    return super.until(event, timeout).then((result: any[]) => result[0])
  }

  public off(event: ConnectionEvent, uuid: string): void {
    super.off(event, uuid)
  }

  protected emit(event: ConnectionEvent, payload: ConnectionListenerPayload): void {
    console.log(this.id, event, payload)
    super.emit(event, payload)
  }
}
