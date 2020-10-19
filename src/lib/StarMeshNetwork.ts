import { ConnectionManager } from './ConnectionManager'
import { ConnectionListenerPayload, ConnEvent } from './ConnectionTypes'
import { PkgType } from './PkgType'
import { Connection } from './Connection'
import { Observable } from './Observable'
import { clone, uniq } from 'ramda'
import { pause } from './pause'
import { NETWORK_STATE_BUSY_ERROR, NetworkStateBusyError } from './errors/NetworkStateBusyError'

export enum StarMeshNetworkEvents {
  STATE_CHANGE,
  MEMBERS_CHANGE,
  MEMBERS_JOIN,
  MEMBERS_LEFT,
  NETWORK_ERROR,
  HOST_CHANGE
}

export interface StarMeshEventPayload<T> {
  state?: T
  members?: string[]
  error?: Error
  host?: string
}

export type StarMeshAction = Record<string, unknown>

export type StarMeshReducer<T, U = never> = (prevState: T, action: U | StarMeshAction, connId: string) => T

interface MemberChangePayload {
  members: string[]
  host?: string
}

const isMemberChangePayload = (data: unknown): data is MemberChangePayload => {
  if (typeof data === 'object' && data !== null) {
    if ('members' in data && 'host' in data) {
      const d = data as { members: unknown, host: unknown }
      return Array.isArray(d.members) && d.members.reduce((p: boolean, c) => p && typeof c === 'string', true)
    }
  }
  return false
}

export class StarMeshNetwork<T = Record<string, unknown>> extends Observable<typeof StarMeshNetworkEvents, StarMeshEventPayload<T>> {
  hostConnectionManager?: ConnectionManager
  myConnectionManager: ConnectionManager
  meToHostConnection?: Connection
  members: string[] = []

  state: T
  networkName?: string

  reducer?: StarMeshReducer<T>
  hostId?: string
  initialState: T

  haveActiveRequest = false

  requestQueue: Array<{ action: StarMeshAction, resolve: () => void, reject: (error: Error) => void }> = []
  private stateStaging?: T

  public get id (): string {
    return this.myConnectionManager.id
  }

  constructor (myConnectionManager: ConnectionManager, initialState: T, reducer?: StarMeshReducer<T>) {
    super()
    this.reducer = reducer
    this.initialState = clone(initialState)
    this.myConnectionManager = myConnectionManager
    this.initMyConnectionManagerListeners()
    this.state = clone(initialState)
  }

  private readonly networkErrorHandler = (error: Error): void => {
    // console.log(this.id, error)
    this.emit(StarMeshNetworkEvents.NETWORK_ERROR, { error })
  }

  public isHost (): boolean | undefined {
    if (this.hostConnectionManager !== undefined) {
      return true
    } else if (this.meToHostConnection !== undefined) {
      return false
    } else {
      return undefined
    }
  }

  public sendToHost = async (pkgType: PkgType, data: unknown): Promise<ConnectionListenerPayload> => {
    if (this.meToHostConnection === undefined) {
      throw new Error('not connected to host')
    }
    return await this.myConnectionManager.sendPkg(this.meToHostConnection.id, pkgType, data)
  }

  public get myId (): string {
    return this.myConnectionManager.id
  }

  private readonly initMyConnectionManagerListeners = (): void => {
    this.myConnectionManager.onPkg(PkgType.MEMBER_CHANGE, ({ data }) => {
      this.handleMemberChange(data).catch(this.networkErrorHandler)
    })
    this.myConnectionManager.onPkg(PkgType.SET_STATE, ({ data }) => {
      this.emit(StarMeshNetworkEvents.STATE_CHANGE, { state: data as T })
      this.state = data as T
    })
    this.myConnectionManager.onPkg(PkgType.DISPATCH, this.dispatchHandler)
    this.myConnectionManager.onPkg(PkgType.CANCEL, () => {
      this.stateStaging = undefined
    })
    this.myConnectionManager.onPkg(PkgType.PROMOTE, () => {
      if (this.stateStaging !== undefined) {
        this.setState(this.stateStaging)
        this.stateStaging = undefined
      } else {
        throw new Error('promote before staging')
      }
    })
  }

  public async joinOrHost (networkName: string): Promise<void> {
    this.networkName = networkName
    try {
      console.log('[joinOrHost] to host')
      await this.host(networkName)
      console.log('[joinOrHost] to join')
      await this.join(networkName)
      console.log('[joinOrHost] end join')
    } catch (e) {
      console.log('[joinOrHost] fail host to join')
      await this.join(networkName)
      console.log('[joinOrHost] joined without host')
    }
  }

  private readonly host = async (networkName: string): Promise<void> => {
    const hostConnection = await ConnectionManager.startPrefix(networkName)
    const oldHost = this.hostId
    this.hostId = this.id
    this.hostConnectionManager = hostConnection
    this.hostConnectionManager.on(ConnEvent.CONN_OPEN, ({ conn }) => {
      if (conn !== undefined) {
        this.hostConnectionManager?.broadcastPkg(PkgType.MEMBER_CHANGE, {
          host: this.hostId,
          members: [...this.members, conn.id]
        })
          .catch(this.networkErrorHandler)
        conn.sendPkg(PkgType.SET_STATE, clone(this.state)).catch(this.networkErrorHandler)
      }
    })
    this.hostConnectionManager.on(ConnEvent.CONN_CLOSE, ({ conn }) => {
      this.hostConnectionManager?.broadcastPkg(PkgType.MEMBER_CHANGE, {
        host: this.id,
        members: this.members.filter(id => id !== conn?.id)
      })
        .catch(this.networkErrorHandler)
    })
    // if there are existing members, probably the members were connected to a disconnected host
    // so update them to use the new host
    if (this.members.length > 0) {
      const members = this.members.filter(n => n !== oldHost)
      await Promise.all(members.map(async (id: string): Promise<Connection> => await hostConnection?.connect(id))).catch(console.log)
      await hostConnection.broadcastPkg(PkgType.MEMBER_CHANGE, {
        host: this.id,
        members
      })
    }
  }

  private readonly join = async (networkName: string): Promise<void> => {
    console.log('[join] to connect', networkName)
    this.meToHostConnection = await this.myConnectionManager.connectPrefix(networkName)
    console.log('[join] done connect')
    this.meToHostConnection.on(ConnEvent.CONN_CLOSE, () => {
      console.log('on conn close')
      if (this.members.length > 1) {
        if (this.networkName !== undefined && !this.myConnectionManager.isClosed() && this.members.filter(n => n !== this.hostId)[0] === this.id) {
          this.host(this.networkName).catch(this.networkErrorHandler)
        }
      }
    })
    console.log('wait members non empty')
    while (this.members.length === 0) {
      await pause(100)
    }
    console.log('got members')
    while (!this.members.reduce((flag: boolean, member) => flag && undefined !== this.myConnectionManager.connections.find(({ id }) => id === member), true)) {
      console.log('what is this')
      await pause(100)
    }
  }

  private readonly handleMemberChange = async (data: unknown): Promise<void> => {
    if (isMemberChangePayload(data)) {
      this.emit(StarMeshNetworkEvents.HOST_CHANGE, { host: data.host })
      if (data.members.length === this.members.length && this.members.reduce((f: boolean, c) => f && data.members.includes(c), true)) {
        return
      }
      this.hostId = data.host
      const oldList = [...this.members]
      const newList = data.members
      this.members = [...newList]
      // connect to new member
      const memberJoining = newList.filter(n => !oldList.includes(n))
      const memberLeaving = oldList.filter(n => !newList.includes(n))
      try {
        await Promise.all(memberJoining.map(async n => {
          return await this.myConnectionManager.connect(n)
        }))
        // disconnect leave member
        memberLeaving.forEach(n => {
          this.myConnectionManager.disconnect(n)
        })
      } catch (e) {
        this.emit(StarMeshNetworkEvents.NETWORK_ERROR, e)
        console.log(e)
      }
      if (memberJoining.length > 0 || memberLeaving.length > 0) {
        this.emit(StarMeshNetworkEvents.MEMBERS_CHANGE, { members: this.members })
      }
      if (memberJoining.length > 0) {
        this.emit(StarMeshNetworkEvents.MEMBERS_JOIN, { members: memberJoining })
      }
      if (memberLeaving.length > 0) {
        this.emit(StarMeshNetworkEvents.MEMBERS_LEFT, { members: memberLeaving })
      }
    } else {
      throw new Error('wrong member change payload')
    }
  }

  public setReducer = (reducer: StarMeshReducer<T>): void => {
    this.reducer = reducer
  }

  public dispatch = async (action: StarMeshAction): Promise<void> => {
    const queueThisAction = async (): Promise<void> => await new Promise((resolve, reject) => {
      this.requestQueue.push({ action, resolve, reject })
    })
    if (this.haveActiveRequest) {
      return await queueThisAction()
    }
    this.haveActiveRequest = true
    const responses = await Promise.all(this.members.map(async (id) => await this.myConnectionManager.sendPkg(id, PkgType.DISPATCH, action)))
    let gotBusyError = false
    const gotValidationErrors: string[] = []
    responses.forEach(({ data }) => {
      if (data !== undefined && data !== true) {
        if (typeof data === 'string') {
          if (data === NETWORK_STATE_BUSY_ERROR) {
            gotBusyError = true
          } else {
            gotValidationErrors.push(data)
          }
        }
      }
    })
    let error
    if (gotValidationErrors.length > 0) {
      this.haveActiveRequest = false
      await Promise.all(this.members.map(async (id) => await this.myConnectionManager.sendPkg(id, PkgType.CANCEL, {})))
      const filtered = uniq(gotValidationErrors)
      if (filtered.length === 0) {
        error = new Error(filtered[0])
      } else {
        error = new Error(`Multiple Errors: ${filtered.join(',')}`)
      }
    } else if (gotBusyError) {
      this.haveActiveRequest = false
      await Promise.all(this.members.map(async (id) => await this.myConnectionManager.sendPkg(id, PkgType.CANCEL, {})))
      await queueThisAction()
    } else {
      await Promise.all(this.members.map(async (id) => await this.myConnectionManager.sendPkg(id, PkgType.PROMOTE, {})))
    }
    {
      const { action, resolve, reject } = this.requestQueue.shift() ?? {}
      if (action !== undefined && resolve !== undefined && reject !== undefined) {
        this.dispatch(action).then(resolve).catch(reject)
      }
    }
    if (error !== undefined) {
      throw error
    }
  }

  public dispatchLocal = async (action: StarMeshAction): Promise<void> => {
    if (this.reducer === undefined) {
      this.emit(StarMeshNetworkEvents.NETWORK_ERROR, { error: new Error('no reducer defined') })
      throw new Error('no reducer defined')
    }
    const newState = this.reducer(this.state, action, this.id)
    this.setState(newState)
    return await Promise.resolve()
  }

  private readonly dispatchHandler = ({ conn, data, ack }: ConnectionListenerPayload): void => {
    if (this.reducer === undefined) {
      this.emit(StarMeshNetworkEvents.NETWORK_ERROR, { error: new Error('no reducer defined') })
      ack?.('no reducer defined')
    } else if (conn === undefined) {
      this.emit(StarMeshNetworkEvents.NETWORK_ERROR, { error: new Error('no conn') })
      ack?.('no conn')
    } else {
      if (this.stateStaging !== undefined) {
        throw new NetworkStateBusyError()
      }
      try {
        this.stateStaging = this.reducer(this.state, data as StarMeshAction, conn.id)
        ack?.(true)
      } catch (e: unknown) {
        ack?.((e as Error).message)
      }
    }
  }

  private readonly setState = (newState: T): void => {
    this.state = newState
    this.emit(StarMeshNetworkEvents.STATE_CHANGE, { state: newState })
  }

  public leave = (): void => {
    this.networkName = undefined
    this.hostConnectionManager?.destroy()
    this.meToHostConnection?.close()
    this.emit(StarMeshNetworkEvents.MEMBERS_LEFT, { members: this.members })
    this.emit(StarMeshNetworkEvents.MEMBERS_CHANGE, { members: [] })
    this.meToHostConnection = undefined
    this.hostConnectionManager = undefined
    this.state = clone(this.initialState)
    this.members = []
    this.hostId = undefined
  }
}
