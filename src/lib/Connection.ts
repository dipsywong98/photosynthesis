import { DataConnection } from 'peerjs'
import { v4 } from 'uuid'
import { ConnectionListenerPayload, ConnEvent, Package, PayloadData } from './ConnectionTypes'
import { ConnectionManager } from './ConnectionManager'
import { Observable } from './Observable'
import { PkgType } from './PkgType'

export class Connection extends Observable<typeof ConnEvent, ConnectionListenerPayload> {
  protected conn?: DataConnection // undefined if it is connecting to itself
  protected manager: ConnectionManager

  protected log (...params: unknown[]): void {
    this.manager.log(...params)
  }

  public get id (): string {
    if (this.conn !== undefined) {
      return this.conn.peer
    } else {
      return this.manager.id
    }
  }

  constructor (conn: DataConnection | 'self', connectionManager: ConnectionManager) {
    super()
    if (conn !== 'self') {
      this.conn = conn
      this.enrichConn(conn)
    }
    this.manager = connectionManager
  }

  public async send (data: Package): Promise<ConnectionListenerPayload> {
    const pid = v4().split('-')[0]
    const promise = this.manager.untilMatch(
      ConnEvent.CONN_ACK,
      ({ pid: p }: ConnectionListenerPayload) => p === pid)
    if (this.conn !== undefined) {
      this.conn.send([pid, data])
    } else {
      this.dataHandler()([pid, data])
    }
    return await promise
  }

  public async sendPkg (type: PkgType, data: unknown): Promise<ConnectionListenerPayload> {
    return await this.send({
      data,
      _t: type
    })
  }

  public close (): void {
    this.conn?.close()
    this.emit(ConnEvent.CONN_CLOSE, {})
  }

  private readonly dataHandler = (conn?: DataConnection) => ([pid, data]: PayloadData) => {
    if (data !== undefined && data._t !== PkgType.ACK) {
      let response: unknown
      const ack = (v: unknown): void => {
        response = v
      }
      this.emit(ConnEvent.CONN_DATA, { conn: this, data, ack })
      if (typeof data === 'object' && data._t !== undefined) {
        this.emit(ConnEvent.CONN_PKG, { conn: this, data: data.data, type: data._t, ack })
      }
      if (conn !== undefined) {
        if (response === undefined) {
          conn.send([pid, { _t: PkgType.ACK, data: response }])
        } else {
          conn.send([pid, { _t: PkgType.ACK, data: response }])
        }
      } else {
        if (response === undefined) {
          this.dataHandler()([pid, { _t: PkgType.ACK, data: undefined }])
        } else {
          this.dataHandler()([pid, { _t: PkgType.ACK, data: response }])
        }
      }
    } else {
      if (typeof data === 'object' && data._t !== undefined) {
        this.emit(ConnEvent.CONN_ACK, { conn: this, data: data.data, type: data._t, pid })
      } else {
        this.emit(ConnEvent.CONN_ACK, { conn: this, data, pid })
      }
    }
  }

  private enrichConn (conn: DataConnection): DataConnection {
    conn.on('open', () => {
      this.emit(ConnEvent.CONN_OPEN, { conn: this })
    })
    conn.on('data', this.dataHandler(conn))
    conn.on('error', (error: Error) => {
      this.emit(ConnEvent.CONN_ERROR, { conn: this, error })
    })
    conn.on('close', () => {
      this.emit(ConnEvent.CONN_CLOSE, { conn: this })
    })
    return conn
  }

  public emit (event: ConnEvent, payload: ConnectionListenerPayload): void {
    super.emit(event, payload)
    this.manager.emit(event, payload)
  }
}
