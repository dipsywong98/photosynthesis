import { FakePeer } from './FakePeer'

describe('Fake Peer System', () => {
  it('calls open when constructed', (done) => {
    const peer = new FakePeer()
    peer.on('open', (id) => {
      expect(id).toEqual(peer.id)
      done()
    })
  })
  it('throws error when initializing as existing peer', () => {
    const _ = new FakePeer('1')
    expect(() => {
      const _ = new FakePeer('1')
    }).toThrowError()
  })

  describe('connect with other peer', () => {
    it('trigger peer connection event', (done) => {
      const peer1 = new FakePeer()
      const peer2 = new FakePeer()
      peer2.on('connection', (conn) => {
        expect(conn).toBeTruthy()
        done()
      })
      peer1.connect(peer2.id)
    })
    it('trigger conn open event', (done) => {
      let cnt = 0
      const chk = (): void => {
        if (++cnt === 2) done()
      }
      const peer1 = new FakePeer()
      const peer2 = new FakePeer()
      peer2.on('connection', (conn) => {
        expect(conn).toBeTruthy()
        conn.on('open', () => {
          chk()
        })
      })
      const conn = peer1.connect(peer2.id)
      conn.on('open', () => {
        chk()
      })
    })
    it('updates the connection list', () => {
      const peer1 = new FakePeer()
      const peer2 = new FakePeer()
      expect(peer1.connections.length).toEqual(0)
      expect(peer2.connections.length).toEqual(0)
      peer1.connect(peer2.id)
      expect(peer1.connections.length).toEqual(1)
      expect(peer2.connections.length).toEqual(1)
      expect(peer1.connections[0].peer).toEqual(peer2.id)
      expect(peer2.connections[0].peer).toEqual(peer1.id)
      expect(peer1.connections[0].otherEnd).toBe(peer2.connections[0])
      expect(peer2.connections[0].otherEnd).toBe(peer1.connections[0])
    })
    it('can send message', (done) => {
      const peer1 = new FakePeer()
      const peer2 = new FakePeer()
      peer2.on('connection', conn => {
        conn.on('data', (data) => {
          expect(data).toEqual('hello world')
          done()
        })
      })
      const conn = peer1.connect(peer2.id)
      conn.on('open', () => {
        conn.send('hello world')
      })
    })
    it('throws error when emitting message before conn open event', () => {
      const peer1 = new FakePeer()
      const peer2 = new FakePeer()
      const conn = peer1.connect(peer2.id)
      expect(() => {
        conn.send('hello world')
      }).toThrowError()
    })
  })

  it('can close connections', (done) => {
    const peer1 = new FakePeer()
    const peer2 = new FakePeer()
    let cnt = 0
    const finish = (): void => {
      expect(peer1.connections.length).toEqual(0)
      expect(peer2.connections.length).toEqual(0)
      done()
    }
    const chk = (): void => {
      if (++cnt === 2) finish()
    }
    peer2.on('connection', conn => {
      conn.on('close', () => {
        chk()
      })
    })
    const conn = peer1.connect(peer2.id)
    conn.on('close', () => {
      chk()
    })
    conn.on('open', () => {
      conn.close()
    })
  })
})

export const x = null
