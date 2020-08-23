import {Connection} from './Connection'

export enum ConnectionEvent {
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
  CONN_ACK = 'ack'
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
}
export type ConnectionListener = (...params: any[]) => void
