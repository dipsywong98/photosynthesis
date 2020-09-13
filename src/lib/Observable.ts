import { v4 as uuidv4 } from 'uuid'
import { equals } from 'ramda'

const TIMEOUT_DURATION = 5000

interface PayloadEssential {
  toString: () => string
}

// eslint-disable-next-line @typescript-eslint/ban-types
type Payload = Exclude<PayloadEssential, Function>

type Listener<P extends Payload> = (payload: P, preventClear?: () => void) => void
type Matcher<P extends Payload> = (payload: P) => boolean

function isMatcher<P extends Payload> (match: P | Matcher<P> | { _: Partial<P> }): match is Matcher<P> {
  return typeof match === 'function'
}

/**
 * @template E `typeof MyEnum` or a general `Record` with event names as keys paired with unique values
 * @template P type of payload
 */
export class Observable<E extends Record<string, string | number> = never, P extends Payload = never> {
  private _onEventListeners: { [k in E[keyof E]]?: Record<string, Listener<P>> } = {}
  private _onceEventListeners: { [k in E[keyof E]]?: Record<string, Listener<P>> } = {}

  public on (event: E[keyof E], listener: Listener<P>): string {
    let events = this._onEventListeners[event]
    if (events === undefined) {
      events = this._onEventListeners[event] = {}
    }
    const uuid = uuidv4()
    events[uuid] = listener
    return uuid
  }

  /**
   * Given event, if the value going to feed to listener is equal to the params, call the listener
   * @param event A value of E
   * @param listener
   * @param match
   */
  public onMatch (event: E[keyof E], listener: Listener<P>, match: P | Matcher<P> | { _: Partial<P> }): string {
    return this.on(event, (value: P) => {
      if (isMatcher(match)) {
        if (match(value)) {
          listener(value)
        }
        // eslint-disable-next-line @typescript-eslint/no-unsafe-call
      } else if (equals(match, value) as unknown as boolean) {
        listener(value)
      } else if (
        '_' in match &&
        Object.keys(match._)
          .reduce(
            (flag: boolean, key) => (
              flag && equals(
                (match._ as Record<string, unknown>)[key],
                (value as Record<string, unknown>)[key])
            ),
            true
          )
      ) {
        listener(value)
      }
    })
  }

  public once (event: E[keyof E], listener: Listener<P>): string {
    let events = this._onceEventListeners[event]
    if (events === undefined) {
      events = this._onceEventListeners[event] = {}
    }
    const uuid = uuidv4()
    events[uuid] = listener
    return uuid
  }

  /**
   *
   * @param event
   * @param listener
   * @param match
   */
  public onceMatch (event: E[keyof E], listener: Listener<P>, match: P | Matcher<P> | { _: Partial<P> }): string {
    return this.once(event, (value: P, preventClear?: () => void) => {
      if (isMatcher(match)) {
        if (match(value)) {
          listener(value, preventClear)
        } else {
          preventClear?.()
        }
        // eslint-disable-next-line @typescript-eslint/no-unsafe-call
      } else if (equals(match, value) as unknown as boolean) {
        listener(value, preventClear)
      } else if (
        '_' in match &&
        Object.keys(match._)
          .reduce(
            (flag: boolean, key) => (
              flag && equals(
                (match._ as Record<string, unknown>)[key],
                (value as Record<string, unknown>)[key])
            ),
            true
          )
      ) {
        listener(value, preventClear)
      } else {
        preventClear?.()
      }
    })
  }

  public async until (event: E[keyof E], timeout = TIMEOUT_DURATION, _message?: unknown): Promise<P> {
    return await new Promise((resolve, reject) => {
      const cb = window.setTimeout(() => {
        reject(new Error(event.toString() + ' timeout'))
      }, timeout)
      this.once(event, (value) => {
        window.clearTimeout(cb)
        resolve(value)
      })
    })
  }

  public async untilMatch (event: E[keyof E], value: P | Matcher<P> | { _: Partial<P> }, timeout = TIMEOUT_DURATION, _message?: unknown): Promise<P> {
    return await new Promise((resolve, reject) => {
      const cb = window.setTimeout(() => {
        reject(new Error(`${event} ${JSON.stringify(value)} timeout`))
      }, timeout)
      this.onceMatch(event, (value) => {
        window.clearTimeout(cb)
        resolve(value)
      }, value)
    })
  }

  public off (event: E[keyof E], uuid: string): void {
    delete this._onEventListeners?.[event]?.[uuid]
    delete this._onceEventListeners?.[event]?.[uuid]
  }

  public emit (event: E[keyof E], value: P): void {
    Object.values(this._onEventListeners?.[event] ?? {})?.forEach((listener) => {
      listener(value)
    })
    const clearUuid: string[] = []
    Object.entries(this._onceEventListeners?.[event] ?? {})?.forEach(([uuid, listener]) => {
      let preventClear = false
      listener(value, () => {
        preventClear = true
      })
      if (!preventClear) {
        clearUuid.push(uuid)
      }
    })
    clearUuid.forEach((uuid) => {
      this.off(event, uuid)
    })
    // if (event !== '*') {
    //   this.emit('*', event, ...params)
    // }
  }
}
