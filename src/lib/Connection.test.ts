import { Connection } from './Connection'
import { ConnectionManager } from './ConnectionManager'
import { FakeConn } from './fake/FakeConn'
import { ConnEvent } from './ConnectionTypes'
import { PkgType } from './PkgType'

describe('Connection', () => {
  describe('send', () => {
    it('can be constructed', () => {
      const conn = new FakeConn()
      const manager = new ConnectionManager()
      const connection = new Connection(conn, manager)
      expect(connection).toBeTruthy()
    })

    it('can send data', () => {
      const conn = new FakeConn()
      conn.open = true
      const manager = new ConnectionManager()
      const connection = new Connection(conn, manager)
      connection.send({ _t: PkgType.ALERT, data: '123' }).catch(e => { throw e })
      expect(conn.sent.length).toEqual(1)
      expect(Array.isArray(conn.sent[0])).toBeTruthy()
      if (Array.isArray(conn.sent[0])) {
        expect(conn.sent[0].length).toEqual(2)
        expect(conn.sent[0][1]).toEqual({ _t: PkgType.ALERT, data: '123' })
      }
    })

    it('can send package', () => {
      const conn = new FakeConn()
      conn.open = true
      const manager = new ConnectionManager()
      const connection = new Connection(conn, manager)
      connection.sendPkg(PkgType.ALERT, '123').catch(e => { throw e })
      expect(conn.sent.length).toEqual(1)
      expect(Array.isArray(conn.sent[0])).toBeTruthy()
      if (Array.isArray(conn.sent[0])) {
        expect(conn.sent[0].length).toEqual(2)
        expect(conn.sent[0][1]).toEqual({
          _t: PkgType.ALERT,
          data: '123'
        })
      }
    })

    it('can send ack', () => {
      const conn = new FakeConn()
      conn.open = true
      const manager = new ConnectionManager()
      // eslint-disable-next-line no-new
      new Connection(conn, manager)
      conn.trigger('data', ['pid', 'dataContent'])
      expect(conn.sent.length).toEqual(1)
      expect(Array.isArray(conn.sent[0])).toBeTruthy()
      if (Array.isArray(conn.sent[0])) {
        expect(conn.sent[0][0]).toEqual('pid')
      }
    })

    it('can send ack package', () => {
      const conn = new FakeConn()
      conn.open = true
      const manager = new ConnectionManager()
      // eslint-disable-next-line no-new
      new Connection(conn, manager)
      conn.trigger('data', ['pid', {
        _t: 'pkg type',
        data: '123'
      }])
      expect(conn.sent.length).toEqual(1)
      expect(Array.isArray(conn.sent[0])).toBeTruthy()
      if (Array.isArray(conn.sent[0])) {
        expect(conn.sent[0][0]).toEqual('pid')
      }
    })

    it('can await send ack', () => {
      const conn = new FakeConn()
      conn.open = true
      const manager = new ConnectionManager()
      const connection = new Connection(conn, manager)
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-expect-error
      const promise = connection.send('something')

      expect(Array.isArray(conn.sent[0])).toBeTruthy()
      if (Array.isArray(conn.sent[0])) {
        expect(typeof conn.sent[0][0]).toEqual('string')
        if (typeof conn.sent[0][0] === 'string') {
          const pid = conn.sent[0][0]
          conn.trigger('data', [pid])
          return expect(promise).resolves.toEqual({
            conn: connection,
            data: undefined,
            pid
          })
        }
      }
    })
  })

  describe('receive', () => {
    it('can subscribe to data event', () => {
      const cb = jest.fn()
      const conn = new FakeConn()
      conn.open = true
      const manager = new ConnectionManager()
      const connection = new Connection(conn, manager)
      connection.on(ConnEvent.CONN_DATA, cb)
      conn.trigger('data', ['pid', '123'])
      expect(cb).toHaveBeenCalledTimes(1)
      expect(cb).toHaveBeenCalledWith({
        ack: expect.any(Function) as () => void,
        conn: connection,
        data: '123'
      })
      conn.trigger('data', ['pid', '123'])
      expect(cb).toHaveBeenCalledTimes(2)
    })

    it('can subscribe to pkgType', () => {
      const cb = jest.fn()
      const conn = new FakeConn()
      conn.open = true
      const manager = new ConnectionManager()
      const connection = new Connection(conn, manager)
      connection.on(ConnEvent.CONN_PKG, cb)
      conn.trigger('data', ['pid', '123'])
      expect(cb).toHaveBeenCalledTimes(0)
      conn.trigger('data', ['pid', {
        _t: 'pkgType',
        data: '123'
      }])
      expect(cb).toHaveBeenCalledTimes(1)
      expect(cb).toHaveBeenCalledWith({
        ack: expect.any(Function) as () => void,
        conn: connection,
        data: '123',
        type: 'pkgType'
      })
    })
  })
})
