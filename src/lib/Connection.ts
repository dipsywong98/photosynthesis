import {DataConnection} from "peerjs"
import {v4} from 'uuid'
import {ConnectionListenerPayload, ConnEvent} from './ConnectionTypes'
import {ConnectionManager} from './ConnectionManager'

export class Connection {
  protected conn: DataConnection
  protected manager: ConnectionManager

  protected log(...params: any[]) {
    this.manager.log(...params)
  }

  public get id(){
    return this.conn.peer
  }

  constructor(conn: DataConnection, connectionManager: ConnectionManager) {
    this.conn = conn
    this.manager = connectionManager
    this.enrichConn(conn)
  }

  public send(data: any): Promise<unknown> {
    let pid = v4().split('-')[0]
    this.conn.send([pid, data])
    return this.manager.untilMatch(ConnEvent.CONN_ACK, ({pid: p}: ConnectionListenerPayload) => p === pid)
      .catch((e) => console.log('ack error', e)).then(() => this.log('acked', pid))
  }

  public sendPkg(type: string, data: any): Promise<unknown> {
    return this.send({
      data,
      _t: type,
    })
  }

  public close(): void {
    this.conn.close()
  }

  private enrichConn(conn: DataConnection): DataConnection {
    conn.on('open', () => {
      this.emit(ConnEvent.CONN_OPEN, {conn: this})
    })
    conn.on('data', ([pid, data]) => {
      this.log('conn data', pid, data)
      if (data !== undefined) {
        this.emit(ConnEvent.CONN_DATA, {conn: this, data})
        if(typeof data === 'object' && data._t !== undefined){
          this.emit(ConnEvent.CONN_PKG, {conn: this, data})
        }
        conn.send([pid])
      } else {
        this.emit(ConnEvent.CONN_ACK, {conn: this, pid})
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
    this.manager.emit(event, payload)
  }
}
