export class ConnectionTimeoutError extends Error {
  type = 'connection timeout'

  constructor (id: string) {
    super()
    this.message = 'connection timeout to peer ' + id
  }
}
