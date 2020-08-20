import {v4 as uuidv4} from 'uuid'

export class Observable {
  private _onEventListeners: { [event: string]: { [uuid: string]: Function } } = {}
  private _onceEventListeners: { [event: string]: { [uuid: string]: Function } } = {}

  constructor() {
    this._onEventListeners = {}
    this._onceEventListeners = {}
  }

  public on(event: number | string, listener: Function) {
    if (!this._onEventListeners) {
      this._onEventListeners = {}
    }
    if (!(event in this._onEventListeners)) {
      this._onEventListeners[event] = {}
    }
    const uuid = uuidv4()
    this._onEventListeners[event][uuid] = listener
    return uuid
  }

  public once(event: number | string, listener: Function) {
    if (!this._onceEventListeners) {
      this._onceEventListeners = {}
    }
    if (!(event in this._onceEventListeners)) {
      this._onceEventListeners[event] = {}
    }
    const uuid = uuidv4()
    this._onceEventListeners[event][uuid] = listener
    return uuid
  }

  /**
   *
   * @param event
   * @param params values to match, if match call the callback and unsubscribe, or pass a function, return true to call the callback and unsubscribe
   *  last param is the callback
   */
  public onceMatch(event: number | string, ...params: any[]): string {
    const listener = params.pop()
    return this.once(event, (...values: any[]) => {
      const preventClear = values.pop()
      if (
        (params.length !== 0) && (
          (typeof params[0] === 'function' && !params[0](...values))
          || (params.length !== values.length)
          || (!params.reduce((prev, curr, k) => prev && curr === values[k], true))
        )
      ) {
        preventClear()
      } else {
        listener(...values, preventClear)
      }
    })
  }

  public until(event: number | string, timeout = 500): Promise<any[]> {
    return new Promise((resolve, reject) => {
      const cb = window.setTimeout(() => {
        reject(event + ' timeout')
      }, timeout)
      this.once(event, (...params: any[]) => {
        window.clearTimeout(cb)
        resolve(params)
      })
    })
  }

  public untilMatch(event: number | string, value: any, timeout = 500): Promise<any[]> {
    return new Promise((resolve, reject) => {
      const cb = window.setTimeout(() => {
        reject(`${event} ${value.toString()} timeout`)
      }, timeout)
      this.onceMatch(event, value, (...params: any[]) => {
        window.clearTimeout(cb)
        resolve(params)
      })
    })
  }

  public off(event: number | string, uuid: string) {
    delete this._onEventListeners?.[event]?.[uuid]
    delete this._onceEventListeners?.[event]?.[uuid]
  }

  protected emit(...params: any[]) {
    const event: number | string = params.shift()
    Object.values(this._onEventListeners?.[event] || {})?.forEach((listener) => {
      listener(...params)
    })
    const clearUuid: string[] = []
    Object.entries(this._onceEventListeners?.[event] || {})?.forEach(([uuid, listener]) => {
      let preventClear = false
      listener(...params, () => preventClear = true)
      if (!preventClear) {
        clearUuid.push(uuid)
      }
    })
    clearUuid.forEach((uuid) => {
      this.off(event, uuid)
    })
    // delete this._onceEventListeners?.[event]
  }
}
