import { Observable } from './Observable'

enum TestEvent {
  ANY = '*',
  SOME_EVENT = 0,
}

describe('Observable', () => {
  it('can subscribe and publish', () => {
    const observable = new Observable<typeof TestEvent, string>()
    const cb = jest.fn()
    observable.on(TestEvent.SOME_EVENT, cb)
    expect(cb).toBeCalledTimes(0)
    observable.emit(TestEvent.SOME_EVENT, 'abcd')
    expect(cb).toBeCalledTimes(1)
    expect(cb).toBeCalledWith('abcd')
  })
  it('can subscribe once', () => {
    const observable = new Observable<typeof TestEvent, string>()
    const cb = jest.fn()
    observable.once(TestEvent.SOME_EVENT, cb)
    expect(cb).toBeCalledTimes(0)
    observable.emit(TestEvent.SOME_EVENT, 'abcd')
    expect(cb).toBeCalledTimes(1)
    expect(cb).toBeCalledWith('abcd', expect.any(Function))
    observable.emit(TestEvent.SOME_EVENT, 'abcd')
    expect(cb).toBeCalledTimes(1)
  })
  it('can subscribe once and prevent remove', () => {
    const observable = new Observable<typeof TestEvent, string>()
    let count = 0
    const cb = jest.fn((value: string, prevent?: () => void) => {
      if (count < 2) {
        prevent?.()
      }
      count++
    })
    observable.once(TestEvent.SOME_EVENT, cb)
    expect(cb).toBeCalledTimes(0)
    observable.emit(TestEvent.SOME_EVENT, 'abcd')
    expect(cb).toBeCalledTimes(1)
    expect(count).toBe(1)
    expect(cb).toBeCalledWith('abcd', expect.any(Function))
    observable.emit(TestEvent.SOME_EVENT, 'efgh')
    expect(cb).toBeCalledTimes(2)
    expect(count).toBe(2)
    observable.emit(TestEvent.SOME_EVENT, 'ijkl')
    expect(cb).toBeCalledTimes(3)
    expect(count).toBe(3)
    observable.emit(TestEvent.SOME_EVENT, 'mnop')
    expect(cb).toBeCalledTimes(3)
  })
  it('can subscribe until callback called', async (done) => {
    const observable = new Observable<typeof TestEvent, string>()
    let calledTimes = 0
    observable.until(TestEvent.SOME_EVENT).then((value) => {
      calledTimes++
      expect(value).toEqual('abcd')
      observable.emit(TestEvent.SOME_EVENT, 'efgh')
    }).catch(() => {
      throw new Error('fail')
    })
    observable.emit(TestEvent.SOME_EVENT, 'abcd')
    const result = await observable.until(TestEvent.SOME_EVENT)
    expect(result).toEqual('efgh')
    observable.emit(TestEvent.SOME_EVENT, 'ijkl')
    expect(calledTimes).toEqual(1)
    done()
  })
  describe('can subscribe once match', () => {
    it('example: value', () => {
      const observable = new Observable<typeof TestEvent, string>()
      const cb = jest.fn()
      observable.onceMatch(TestEvent.SOME_EVENT, cb, 'foo')
      expect(cb).toBeCalledTimes(0)

      observable.emit(TestEvent.SOME_EVENT, 'bar')
      expect(cb).toBeCalledTimes(0)

      observable.emit(TestEvent.SOME_EVENT, 'foo')
      expect(cb).toBeCalledTimes(1)

      observable.emit(TestEvent.SOME_EVENT, 'foo')
      expect(cb).toBeCalledTimes(1)
    })

    it('example: function matcher', () => {
      const observable = new Observable<typeof TestEvent, string>()
      const cb = jest.fn()
      observable.onceMatch(TestEvent.SOME_EVENT, cb, (v: string) => v === 'foo')
      expect(cb).toBeCalledTimes(0)

      observable.emit(TestEvent.SOME_EVENT, 'bar')
      expect(cb).toBeCalledTimes(0)

      observable.emit(TestEvent.SOME_EVENT, 'foo')
      expect(cb).toBeCalledTimes(1)

      observable.emit(TestEvent.SOME_EVENT, 'foo')
      expect(cb).toBeCalledTimes(1)
    })
  })
  it('can subscribe until match', async (done) => {
    const observable = new Observable<typeof TestEvent, string>()
    let calledTimes = 0
    observable.untilMatch(TestEvent.SOME_EVENT, 'foo').then(value => {
      calledTimes++
      expect(value).toEqual('foo')
      observable.emit(TestEvent.SOME_EVENT, 'efgh')
    }).catch(() => {
      throw new Error('fail')
    })
    observable.emit(TestEvent.SOME_EVENT, 'bar')
    expect(calledTimes).toEqual(0)
    observable.emit(TestEvent.SOME_EVENT, 'foo')
    const value = await observable.untilMatch(TestEvent.SOME_EVENT, 'efgh')
    expect(value).toEqual('efgh')
    expect(calledTimes).toEqual(1)
    observable.emit(TestEvent.SOME_EVENT, 'foo')
    expect(calledTimes).toEqual(1)
    done()
  })
  it('can subscribe until partial match', async (done) => {
    const observable = new Observable<typeof TestEvent, { k?: string, extra?: string }>()
    let calledTimes = 0
    const p = observable.untilMatch(TestEvent.SOME_EVENT, {
      _: { k: 'foo' }
    }).then(value => {
      calledTimes++
      expect(value.k).toEqual('foo')
      observable.emit(TestEvent.SOME_EVENT, { k: 'bar' })
    }).catch(() => {
      throw new Error('fail')
    })
    observable.emit(TestEvent.SOME_EVENT, { extra: 'bar' })
    expect(calledTimes).toEqual(0)
    observable.emit(TestEvent.SOME_EVENT, { k: 'foo', extra: 'bar' })
    await p
    expect(calledTimes).toEqual(1)
    done()
  })
  // it('can subscribe * event', () => {
  //   const observable = new Observable<typeof TestEvent, string>()
  //   const cb = jest.fn()
  //   observable.on(TestEvent.ANY, cb)
  //   expect(cb).toBeCalledTimes(0)
  //   observable.emit(TestEvent.SOME_EVENT, 'abcd')
  //   expect(cb).toBeCalledTimes(1)
  //   expect(cb).toBeCalledWith(TestEvent.SOME_EVENT, 'abcd')
  // })
  it('can subscribe on match event', () => {
    const observable = new Observable<typeof TestEvent, string>()
    const cb = jest.fn()
    observable.onMatch(TestEvent.SOME_EVENT, cb, 'foo')
    expect(cb).toBeCalledTimes(0)
    observable.emit(TestEvent.SOME_EVENT, 'bar')
    expect(cb).toBeCalledTimes(0)
    observable.emit(TestEvent.SOME_EVENT, 'foo')
    expect(cb).toBeCalledTimes(1)
    observable.emit(TestEvent.SOME_EVENT, 'foo')
    expect(cb).toBeCalledTimes(2)
  })
  it('can subscribe on match object event', () => {
    const observable = new Observable<typeof TestEvent, { nested?: string }>()
    const cb = jest.fn()
    observable.onMatch(TestEvent.SOME_EVENT, cb, { nested: 'foo' })
    expect(cb).toBeCalledTimes(0)
    observable.emit(TestEvent.SOME_EVENT, {})
    expect(cb).toBeCalledTimes(0)
    observable.emit(TestEvent.SOME_EVENT, { nested: 'foo' })
    expect(cb).toBeCalledTimes(1)
    observable.emit(TestEvent.SOME_EVENT, { nested: 'bar' })
    expect(cb).toBeCalledTimes(1)
  })
  it('can subscribe on partial match object event', () => {
    const observable = new Observable<typeof TestEvent, { nested?: string, another?: string }>()
    const cb = jest.fn()
    observable.onMatch(TestEvent.SOME_EVENT, cb, { _: { nested: 'foo' } })
    expect(cb).toBeCalledTimes(0)
    observable.emit(TestEvent.SOME_EVENT, {})
    expect(cb).toBeCalledTimes(0)
    observable.emit(TestEvent.SOME_EVENT, { nested: 'foo' })
    expect(cb).toBeCalledTimes(1)
    observable.emit(TestEvent.SOME_EVENT, { nested: 'foo', another: 'wut' })
    expect(cb).toBeCalledTimes(2)
  })
  it('can subscribe on match function event', () => {
    const observable = new Observable<typeof TestEvent, string>()
    const cb = jest.fn()
    observable.onMatch(TestEvent.SOME_EVENT, cb, v => v === 'foo')
    expect(cb).toBeCalledTimes(0)
    observable.emit(TestEvent.SOME_EVENT, 'bar')
    expect(cb).toBeCalledTimes(0)
    observable.emit(TestEvent.SOME_EVENT, 'foo')
    expect(cb).toBeCalledTimes(1)
    observable.emit(TestEvent.SOME_EVENT, 'foo')
    expect(cb).toBeCalledTimes(2)
  })
})
