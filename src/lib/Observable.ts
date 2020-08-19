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

  public until(event: number | string, timeout = 500): Promise<any[]> {
    return new Promise((resolve, reject) => {
      const cb = window.setTimeout(() => {
        reject('timeout')
      }, timeout)
      this.once(event, (...params: any[]) => {
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
    Object.values(this._onceEventListeners?.[event] || {})?.forEach((listener) => {
      listener(...params)
    })
    delete this._onceEventListeners?.[event]
  }
}
