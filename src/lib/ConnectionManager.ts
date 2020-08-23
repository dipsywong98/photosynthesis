import Peer, {DataConnection} from "peerjs"
import {Observable} from './Observable'
import {ConnectionEvent, ConnectionListener, ConnectionListenerPayload} from './ConnectionTypes'
import {Connection} from './Connection'

type Matcher = (payload: ConnectionListenerPayload) => boolean

export class ConnectionManager extends Observable {
  public id?: string
  private peer: Peer
  private connections: Connection[] = []
  public log = (...params: any[]) => {
    console.log(this.id, ...params)
  }

  public static prefixId(id = ''): string {
    return 'creamy9tale000000' + id
  }

  public static withPrefix(id = ''): ConnectionManager {
    return new ConnectionManager(ConnectionManager.prefixId(id))
  }

  constructor(id?: string) {
    super()
    this.peer = this.initPeer(id)
  }

  public async connect(id: string) {
    const conn = this.peer.connect(id)
    return new Promise((resolve, reject) => {
      const id2 = this.once(ConnectionEvent.PEER_ERROR, ({error}: ConnectionListenerPayload) => {
        reject(error)
      })
      conn.on('open', () => {
        const connection = this.enrichConn(conn)
        this.off(ConnectionEvent.CONN_ERROR, id2)
        resolve(connection)
      })
    })
  }

  public broadcast(data: any): Promise<unknown> {
    return Promise.all(this.connections.map(conn => {
      return conn.send(data)
    }))
  }

  private initPeer(id?: string): Peer {
    const peer = new Peer(id, {
      secure: true
    })
    peer.on('open', this.onPeerOpenHandler(peer))
    peer.on('error', (error) => {
      this.emit(ConnectionEvent.PEER_ERROR, {error})
    })
    peer.on('close', () => {this.emit(ConnectionEvent.PEER_CLOSE, {})})
    peer.on('disconnected', () => {this.emit(ConnectionEvent.PEER_DISCONNECT, {})})

    return peer
  }

  private onPeerOpenHandler = (peer: Peer) => (id: string): void => {
    this.id = id
    this.emit(ConnectionEvent.PEER_OPEN, {})
    peer.on('connection', this.onPeerConnectionHandler)
  }

  private onPeerConnectionHandler = (conn: DataConnection) => {
    const connection = this.enrichConn(conn)
    this.emit(ConnectionEvent.PEER_CONNECT, {conn: connection})
  }

  public on(event: ConnectionEvent, listener: ConnectionListener): string {
    return super.on(event, listener)
  }

  public once(event: ConnectionEvent, listener: ConnectionListener): string {
    return super.once(event, listener)
  }

  public onceMatch(event: ConnectionEvent, value: (unknown | Matcher), listener: ConnectionListener){
    return super.onceMatch(event, value, listener)
  }

  public until(event: ConnectionEvent, timeout?: number): Promise<any[]> {
    return super.until(event, timeout).then((result: any[]) => result[0])
  }

  public untilMatch(event: ConnectionEvent, value: (unknown | Matcher), timeout?: number){
    return super.untilMatch(event, value, timeout)
  }

  public off(event: ConnectionEvent, uuid: string): void {
    super.off(event, uuid)
  }

  public emit(event: ConnectionEvent, payload: ConnectionListenerPayload): void {
    this.log('emit', event, payload)
    super.emit(event, payload)
  }

  private enrichConn(conn: DataConnection): Connection {
    const connection = new Connection(conn, this)
    this.connections.push(connection)
    return connection
  }
}
