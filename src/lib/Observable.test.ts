import {Observable} from './Observable'

describe('Observable', () => {
  it('can subscribe and publish', () => {
    const observable = new Observable()
    const cb = jest.fn()
    observable.on('some event', cb)
    expect(cb).toBeCalledTimes(0)
    observable.emit('some event', 'abcd')
    expect(cb).toBeCalledTimes(1)
    expect(cb).toBeCalledWith('abcd')
  })
  it('can subscribe once', () => {
    const observable = new Observable()
    const cb = jest.fn()
    observable.once('some event', cb)
    expect(cb).toBeCalledTimes(0)
    observable.emit('some event', 'abcd')
    expect(cb).toBeCalledTimes(1)
    expect(cb).toBeCalledWith('abcd', expect.any(Function))
    observable.emit('some event', 'abcd')
    expect(cb).toBeCalledTimes(1)
  })
  it('can subscribe once and prevent remove', () => {
    const observable = new Observable()
    let count = 0
    const cb = jest.fn((value, prevent) => {
      if(count < 2){
        prevent()
      }
      count++
    })
    observable.once('some event', cb)
    expect(cb).toBeCalledTimes(0)
    observable.emit('some event', 'abcd')
    expect(cb).toBeCalledTimes(1)
    expect(count).toBe(1)
    expect(cb).toBeCalledWith('abcd', expect.any(Function))
    observable.emit('some event', 'efgh')
    expect(cb).toBeCalledTimes(2)
    expect(count).toBe(2)
    observable.emit('some event', 'ijkl')
    expect(cb).toBeCalledTimes(3)
    expect(count).toBe(3)
    observable.emit('some event', 'mnop')
    expect(cb).toBeCalledTimes(3)
  })
  it('can subscribe until callback called',  async(done) => {
    const observable = new Observable()
    let calledTimes = 0
    observable.until('some event').then((value) => {
      calledTimes++
      expect(value).toEqual('abcd')
      observable.emit('some event', 'efgh')
    })
    observable.emit('some event', 'abcd')
    const result = await observable.until('some event')
    expect(result).toEqual('efgh')
    observable.emit('some event', 'ijkl')
    expect(calledTimes).toEqual(1)
    done()
  })
  describe('can subscribe once match', () => {
    it('example: value', () => {
      const observable = new Observable()
      const cb = jest.fn()
      observable.onceMatch('some event', 'foo', cb)
      expect(cb).toBeCalledTimes(0)

      observable.emit('some event', 'bar')
      expect(cb).toBeCalledTimes(0)

      observable.emit('some event', 'foo')
      expect(cb).toBeCalledTimes(1)

      observable.emit('some event', 'foo')
      expect(cb).toBeCalledTimes(1)
    })

    it('example: function matcher', () => {
      const observable = new Observable()
      const cb = jest.fn()
      observable.onceMatch('some event', (v: string) => v === 'foo', cb)
      expect(cb).toBeCalledTimes(0)

      observable.emit('some event', 'bar')
      expect(cb).toBeCalledTimes(0)

      observable.emit('some event', 'foo')
      expect(cb).toBeCalledTimes(1)

      observable.emit('some event', 'foo')
      expect(cb).toBeCalledTimes(1)
    })
  })
  it('can subscribe until match', async (done) => {
    const observable = new Observable()
    let calledTimes = 0
    observable.untilMatch('some event', 'foo').then(value => {
      calledTimes++
      expect(value).toEqual('foo')
      observable.emit('some event', 'efgh')
    })
    observable.emit('some event', 'bar')
    expect(calledTimes).toEqual(0)
    observable.emit('some event', 'foo')
    const value = await observable.untilMatch('some event', 'efgh')
    expect(value).toEqual('efgh')
    expect(calledTimes).toEqual(1)
    observable.emit('some event', 'foo')
    expect(calledTimes).toEqual(1)
    done()
  })
  it('can subscribe * event', () => {
    const observable = new Observable()
    const cb = jest.fn()
    observable.on('*', cb)
    expect(cb).toBeCalledTimes(0)
    observable.emit('some event', 'abcd')
    expect(cb).toBeCalledTimes(1)
    expect(cb).toBeCalledWith('some event', 'abcd')
  })
  it('can subscribe on match event', () => {
    const observable = new Observable()
    const cb = jest.fn()
    observable.onMatch('e', 'foo', cb)
    expect(cb).toBeCalledTimes(0)
    observable.emit('e', 'bar')
    expect(cb).toBeCalledTimes(0)
    observable.emit('e', 'foo')
    expect(cb).toBeCalledTimes(1)
    observable.emit('e', 'foo')
    expect(cb).toBeCalledTimes(2)
  })
  it('can subscribe on match function event', () => {
    const observable = new Observable()
    const cb = jest.fn()
    observable.onMatch('e', v => v === 'foo', cb)
    expect(cb).toBeCalledTimes(0)
    observable.emit('e', 'bar')
    expect(cb).toBeCalledTimes(0)
    observable.emit('e', 'foo')
    expect(cb).toBeCalledTimes(1)
    observable.emit('e', 'foo')
    expect(cb).toBeCalledTimes(2)
  })
})
