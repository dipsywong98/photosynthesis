import Peer, { DataConnection } from 'peerjs'
import { Observable } from './Observable'
import { ConnectionListener, ConnectionListenerPayload, ConnEvent, Package } from './ConnectionTypes'
import { Connection } from './Connection'
import { PkgType } from './PkgType'
import { ConnectionTimeoutError } from './errors/ConnectionTimeoutError'
import { PeerFactory } from './PeerFactory'

export class ConnectionManager extends Observable<typeof ConnEvent, ConnectionListenerPayload> {
  public id: string
  protected peer: Peer
  public connections: Connection[] = []
  protected closed = false

  public isClosed (): boolean {
    return this.closed || this.peer.disconnected
  }

  public log = (..._params: unknown[]): void => {
    // console.log(this.id, ..._params)
  }

  public static prefixId (id = ''): string {
    return 'creamy9tale000000' + id
  }

  public static withPrefix (id = ''): ConnectionManager {
    return new ConnectionManager(ConnectionManager.prefixId(id))
  }

  public static async startPrefix (id = ''): Promise<ConnectionManager> {
    return await ConnectionManager.startAs(ConnectionManager.prefixId(id))
  }

  public static async startAs (id?: string): Promise<ConnectionManager> {
    return await new Promise<ConnectionManager>((resolve, reject) => {
      const manager = new ConnectionManager(id)
      manager.once(ConnEvent.PEER_OPEN, () => {
        resolve(manager)
      })
      manager.once(ConnEvent.PEER_ERROR, (payload) => {
        reject(payload.error)
      })
    })
  }

  constructor (id?: string) {
    super()
    this.peer = this.initPeer(id)
    this.id = this.peer.id
    this.on(ConnEvent.CONN_CLOSE, ({ conn }) => {
      if (conn !== undefined) {
        this.connections = this.connections.filter(({ id }) => id !== conn.id)
      }
    })
  }

  public async connect (id: string, timeout = 5000): Promise<Connection> {
    const existing = this.connections.find(({ id: _id }) => _id === id)
    if (existing !== undefined) return Promise.resolve(existing)
    if (id === this.id) {
      return this.enrichConn(new Connection('self', this))
    }
    return await new Promise((resolve, reject) => {
      const id1 = setTimeout(() => {
        reject(new ConnectionTimeoutError(id))
      }, timeout)
      const id2 = this.once(ConnEvent.PEER_ERROR, ({ error }: ConnectionListenerPayload) => {
        reject(error)
      })
      const conn = this.peer.connect(id)
      const openHandler = (): void => {
        const connection: Connection = this.enrichConn(new Connection(conn, this))
        this.off(ConnEvent.CONN_ERROR, id2)
        resolve(connection)
        clearTimeout(id1)
      }
      conn.on('open', () => {
        openHandler()
      })
      if (conn.open) {
        openHandler()
      }
    })
  }

  public async connectPrefix (id: string): Promise<Connection> {
    return await this.connect(ConnectionManager.prefixId(id))
  }

  public async broadcast (data: Package): Promise<unknown> {
    return await Promise.all(this.connections.map(async conn => {
      return await conn.send(data)
    }))
  }

  public async broadcastPkg (pkgType: PkgType, data: unknown): Promise<ConnectionListenerPayload[]> {
    return await Promise.all(this.connections.map(async conn => {
      return await conn.sendPkg(pkgType, data)
    }))
  }

  public conn (id: string): Connection {
    const find = this.connections.find(c => c.id === id)
    if (find === undefined) {
      throw new Error(`connection lost with ${id}`)
    }
    return find
  }

  public async send (id: string, data: Package): Promise<ConnectionListenerPayload> {
    return await this.conn(id).send(data)
  }

  public async sendPkg (id: string, pkgType: PkgType, data: unknown): Promise<ConnectionListenerPayload> {
    return await this.conn(id).sendPkg(pkgType, data)
  }

  private initPeer (id?: string): Peer {
    const peer = PeerFactory.make(id)
    peer.on('open', this.onPeerOpenHandler(peer))
    peer.on('error', (error: Error) => {
      this.emit(ConnEvent.PEER_ERROR, { error })
    })
    peer.on('close', () => {
      this.emit(ConnEvent.PEER_CLOSE, {})
    })
    peer.on('disconnected', () => {
      this.emit(ConnEvent.PEER_DISCONNECT, {})
    })

    return peer
  }

  private readonly onPeerOpenHandler = (peer: Peer) => (id: string): void => {
    this.id = id
    this.emit(ConnEvent.PEER_OPEN, {})
    peer.on('connection', this.onPeerConnectionHandler)
  }

  private readonly onPeerConnectionHandler = (conn: DataConnection): void => {
    this.log('connect', conn.peer)
    const connection = this.enrichConn(new Connection(conn, this))
    connection.once(ConnEvent.CONN_OPEN, () => {
      this.emit(ConnEvent.PEER_CONNECT, { conn: connection })
    })
  }

  public onPkg (pkgType: PkgType, listener: ConnectionListener): string {
    return super.onMatch(ConnEvent.CONN_PKG, ({ data, ...rest }: ConnectionListenerPayload) => {
      listener({ ...rest, data: data, type: pkgType })
    }, { _: { type: pkgType } })
  }

  public oncePkg (pkgType: PkgType, listener: ConnectionListener): string {
    return super.onceMatch(ConnEvent.CONN_PKG, ({ data, ...rest }: ConnectionListenerPayload) => {
      listener({ ...rest, data: data, type: pkgType })
    }, { _: { type: pkgType } })
  }

  public async untilPkg (pkgType: PkgType, timeout?: number): Promise<ConnectionListenerPayload> {
    if (pkgType === undefined) throw new Error('trying to subscribe undefined pkgType')
    return await super.untilMatch(ConnEvent.CONN_PKG, { _: { type: pkgType } }, timeout, pkgType)
      .then(({ data, ...rest }: ConnectionListenerPayload) => {
        return { ...rest, data: data, type: pkgType }
      })
  }

  public on (event: ConnEvent, listener: ConnectionListener): string {
    return super.on(event, listener)
  }

  public once (event: ConnEvent, listener: ConnectionListener): string {
    return super.once(event, listener)
  }

  public emit (event: ConnEvent, payload: ConnectionListenerPayload): void {
    const { conn, ...toLog } = payload
    this.log('emit', event, { ...toLog, ...(conn !== undefined ? { conn: { id: conn?.id } } : {}) })
    super.emit(event, payload)
  }

  private enrichConn (connection: Connection): Connection {
    this.connections.push(connection)
    return connection
  }

  public disconnect (id: string): void {
    this.connections.find(c => c.id === id)?.close()
  }

  public disconnectAll (): void {
    this.connections.map(conn => conn.close())
  }

  public destroy (): void {
    this.closed = true
    this.peer.destroy()
    this.disconnectAll()
  }

  public close (): void {
    this.closed = true
    this.peer.destroy()
    this.disconnectAll()
  }
}
