import {DataConnection} from "peerjs"
import {v4} from 'uuid'
import {ConnectionListenerPayload, ConnEvent} from './ConnectionTypes'
import {ConnectionManager} from './ConnectionManager'
import {Observable} from './Observable'
import {PkgType} from './PkgType'

export class Connection extends Observable {
  protected conn?: DataConnection
  protected manager: ConnectionManager

  protected log(...params: any[]) {
    this.manager.log(...params)
  }

  public get id() {
    if (this.conn) {
      return this.conn.peer
    } else {
      return this.manager.id
    }
  }

  constructor(conn: DataConnection | 'self', connectionManager: ConnectionManager) {
    super()
    if (conn !== 'self') {
      this.conn = conn
      this.enrichConn(conn)
    }
    this.manager = connectionManager
  }

  public send(data: any): Promise<any> {
    let pid = v4().split('-')[0]
    if (this.conn) {
      this.conn.send([pid, data])
    } else {
      this.emit(ConnEvent.CONN_DATA, {conn: this, data})
    }
    return this.manager.untilMatch(ConnEvent.CONN_ACK, ({pid: p}: ConnectionListenerPayload) => p === pid)
      .then(({data, ...rest}: ConnectionListenerPayload) => ({data: data?.data, ...rest, type: data?._t})).catch((e) => console.log('ack error', e))
  }

  public sendPkg(type: string | number, data: any): Promise<ConnectionListenerPayload> {
    return this.send({
      data,
      _t: type
    })
  }

  public close(): void {
    this.conn?.close()
    this.emit(ConnEvent.CONN_CLOSE, {})
  }

  private enrichConn(conn: DataConnection): DataConnection {
    conn.on('open', () => {
      this.emit(ConnEvent.CONN_OPEN, {conn: this})
    })
    conn.on('data', ([pid, data]) => {
      // this.log('conn data', pid, data)
      if (data !== undefined && data._t !== PkgType.ACK) {
        let response = undefined
        const ack = (v: any) => response = v
        this.emit(ConnEvent.CONN_DATA, {conn: this, data, ack})
        if (typeof data === 'object' && data._t !== undefined) {
          this.emit(ConnEvent.CONN_PKG, {conn: this, data, ack})
        }
        console.log(ack, response)
        if (response === undefined) {
          conn.send([pid])
        } else {
          conn.send([pid, {_t: PkgType.ACK, data: response}])
        }
      } else {
        this.emit(ConnEvent.CONN_ACK, {conn: this, data, pid})
      }
    })
    conn.on('error', (error) => {
      this.emit(ConnEvent.CONN_ERROR, {conn: this, error})
    })
    conn.on('close', () => {
      this.emit(ConnEvent.CONN_CLOSE, {conn: this})
    })
    return conn
  }

  public emit(event: ConnEvent, payload: ConnectionListenerPayload): void {
    super.emit(event, payload)
    this.manager.emit(event, payload)
  }
}
