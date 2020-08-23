import {Connection} from './Connection'
import {PkgType} from './PkgType'

export enum ConnEvent {
  ANY = '*',
  PEER_OPEN = '_open',
  PEER_CLOSE = '_close',
  PEER_CONNECT = '_connect',
  PEER_DISCONNECT = '_disconnect',
  PEER_ERROR = '_error',
  CONN_OPEN = 'open',
  CONN_CLOSE = 'close',
  CONN_DATA = 'data',
  CONN_ERROR = 'error',
  CONN_ACK = 'ack',
  CONN_PKG = 'pkg'
}

export interface ConnectionError {
  name: string
  message: string
  stack?: string
  type?: string
}

export interface ConnectionListenerPayload {
  conn?: Connection
  data?: any
  error?: ConnectionError
  pid?: string
  type?: PkgType
}
export type ConnectionListener = (payload: ConnectionListenerPayload) => void
