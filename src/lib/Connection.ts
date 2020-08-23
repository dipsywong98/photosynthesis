import {DataConnection} from "peerjs"
import {v4} from 'uuid'
import {ConnectionEvent, ConnectionListenerPayload} from './ConnectionTypes'
import {ConnectionManager} from './ConnectionManager'

export class Connection {
  private conn: DataConnection
  private manager: ConnectionManager
  private log(...params: any[]) {
    this.manager.log(...params)
  }

  constructor(conn: DataConnection, connectionManager: ConnectionManager) {
    this.conn = conn
    this.manager = connectionManager
    this.enrichConn(conn)
  }

  public send(data: any): Promise<unknown> {
      let pid = v4().split('-')[0]
      this.conn.send([pid, data])
      return this.manager.untilMatch(ConnectionEvent.CONN_ACK, ({pid: p}: ConnectionListenerPayload) => p === pid)
        .catch((e) => console.log('ack error', e)).then(() => this.log('acked', pid))
  }

  private enrichConn(conn: DataConnection): DataConnection {
    conn.on('open', () => {
      this.emit(ConnectionEvent.CONN_OPEN, {conn: this})
    })
    conn.on('data', ([pid, data]) => {
      this.log('conn data', pid, data)
      if(data !== undefined){
        this.emit(ConnectionEvent.CONN_DATA, {conn: this, data})
        conn.send([pid])
      } else{
        this.emit(ConnectionEvent.CONN_ACK, {conn: this, pid})
      }
    })
    conn.on('error', (error) => {
      this.emit(ConnectionEvent.CONN_ERROR, {conn: this, error})
    })
    conn.on('close', () => {
      this.emit(ConnectionEvent.CONN_CLOSE, {conn: this})
    })
    return conn
  }

  public emit(event: ConnectionEvent, payload: ConnectionListenerPayload): void {
    this.manager.emit(event, payload)
  }
}
