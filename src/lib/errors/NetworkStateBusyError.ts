export const NETWORK_STATE_BUSY_ERROR = 'NetworkStateBusyError'

export class NetworkStateBusyError extends Error {
  type = NETWORK_STATE_BUSY_ERROR
}
