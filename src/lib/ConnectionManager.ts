import Peer, {DataConnection} from "peerjs"
import {Observable} from './Observable'
import {ConnectionListener, ConnectionListenerPayload, ConnEvent} from './ConnectionTypes'
import {Connection} from './Connection'
import {PkgType} from './PkgType'

type Matcher = (payload: ConnectionListenerPayload) => boolean

export class ConnectionManager extends Observable {
  public id: string
  protected peer: Peer
  protected connections: Connection[] = []
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
    this.id = this.peer.id
  }

  public async connect(id: string, timeout: number = 5000): Promise<Connection> {
    if(id === this.id) {
      return Promise.resolve(this.enrichConn(new Connection('self', this)))
    }
    return new Promise((resolve, reject) => {
      const id1 = setTimeout(() => reject('connection timeout to peer '+id), timeout)
      const id2 = this.once(ConnEvent.PEER_ERROR, ({error}: ConnectionListenerPayload) => {
        reject(error)
      })
      const openHandler = () => {
        console.log('open', this.id, conn.peer)
        const connection: Connection = this.enrichConn(new Connection(conn, this))
        this.off(ConnEvent.CONN_ERROR, id2)
        resolve(connection)
        clearTimeout(id1)
      }
      const conn = this.peer.connect(id)
      conn.on('open', () => {
        openHandler()
      })

      if(conn.open) {
        openHandler()
      }
    })
  }

  public async connectPrefix(id: string): Promise<Connection> {
    return this.connect(ConnectionManager.prefixId(id))
  }

  public broadcast(data: any): Promise<unknown> {
    return Promise.all(this.connections.map(conn => {
      return conn.send(data)
    }))
  }

  public broadcastPkg(pkgType: PkgType, data: any): Promise<unknown> {
    return Promise.all(this.connections.map(conn => {
      return conn.sendPkg(pkgType, data)
    }))
  }

  public conn(id: string): Connection {
    const find = this.connections.find(c => c.id === id)
    if (find === undefined) {
      throw new Error(`connection lost with ${id}`)
    }
    return find
  }

  public send(id: string, data: any): Promise<ConnectionListenerPayload> {
    return this.conn(id).send(data)
  }

  public sendPkg(id: string, pkgType: PkgType, data: any): Promise<ConnectionListenerPayload> {
    return this.conn(id).sendPkg(pkgType, data)
  }

  private initPeer(id?: string): Peer {
    const peer = new Peer(id, {
      secure: true
    })
    peer.on('open', this.onPeerOpenHandler(peer))
    peer.on('error', (error) => {
      this.emit(ConnEvent.PEER_ERROR, {error})
    })
    peer.on('close', () => {
      this.emit(ConnEvent.PEER_CLOSE, {})
    })
    peer.on('disconnected', () => {
      this.emit(ConnEvent.PEER_DISCONNECT, {})
    })

    return peer
  }

  private onPeerOpenHandler = (peer: Peer) => (id: string): void => {
    this.id = id
    this.emit(ConnEvent.PEER_OPEN, {})
    peer.on('connection', this.onPeerConnectionHandler)
  }

  private onPeerConnectionHandler = (conn: DataConnection) => {
    const connection = this.enrichConn(new Connection(conn, this))
    this.emit(ConnEvent.PEER_CONNECT, {conn: connection})
  }

  public onPkg(pkgType: PkgType, listener: ConnectionListener): string {
    return super.onMatch(ConnEvent.CONN_PKG, ({data}: ConnectionListenerPayload) => data._t === pkgType, ({data, ...rest}: ConnectionListenerPayload) => {
      listener({...rest, data: data.data, type: pkgType})
    })
  }

  public oncePkg(pkgType: PkgType, listener: ConnectionListener): string {
    return super.onceMatch(ConnEvent.CONN_PKG, ({data}: ConnectionListenerPayload) => data._t === pkgType, ({data, ...rest}: ConnectionListenerPayload) => {
      listener({...rest, data: data.data, type: pkgType})
    })
  }

  public untilPkg(pkgType: PkgType, timeout?: number): Promise<any> {
    return super.untilMatch(ConnEvent.CONN_PKG, ({data}: ConnectionListenerPayload) => data._t === pkgType, timeout).then(({data,...rest}: any) => {
      return {...rest, data: data.data, type: pkgType}
    })
  }

  public on(event: ConnEvent, listener: ConnectionListener): string {
    return super.on(event, listener)
  }

  public once(event: ConnEvent, listener: ConnectionListener): string {
    return super.once(event, listener)
  }

  public onceMatch(event: ConnEvent, value: (unknown | Matcher), listener: ConnectionListener) {
    return super.onceMatch(event, value, listener)
  }

  public until(event: ConnEvent, timeout?: number): Promise<any[]> {
    return super.until(event, timeout).then((result: any[]) => result[0])
  }

  public untilMatch(event: ConnEvent, value: (unknown | Matcher), timeout?: number) {
    return super.untilMatch(event, value, timeout)
  }

  public off(event: ConnEvent, uuid: string): void {
    super.off(event, uuid)
  }

  public emit(event: ConnEvent, payload: ConnectionListenerPayload): void {
    this.log('emit', event, payload)
    super.emit(event, payload)
  }

  private enrichConn(connection: Connection): Connection {
    this.connections.push(connection)
    return connection
  }
}
