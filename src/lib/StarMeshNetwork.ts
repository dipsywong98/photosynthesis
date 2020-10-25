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

  activeAction?: StarMeshAction

  requestQueue: Array<{ action: StarMeshAction, resolve: () => void, reject: (error: Error) => void }> = []
  stateStaging?: T

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

  logs: unknown[][] = []

  private log (...params: unknown[]): void {
    console.log(...params)
    this.logs.push(params)
  }

  private readonly networkErrorHandler = (error: Error): void => {
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
      this.log(`check if network ${networkName} exists, if not, create it`)
      await this.host(networkName)
      this.log(`created network ${networkName}`)
      await this.join(networkName)
    } catch (e) {
      this.log(`network ${networkName} exists`)
      await this.join(networkName)
    }
  }

  private readonly host = async (networkName: string): Promise<void> => {
    this.log(`hosting network ${networkName}`)
    const hostConnection = await ConnectionManager.startPrefix(networkName)
    this.log('created hostConnection')
    const oldHost = this.hostId
    this.hostId = this.id
    this.hostConnectionManager = hostConnection
    this.hostConnectionManager.on(ConnEvent.CONN_OPEN, ({ conn }) => {
      if (conn !== undefined) {
        this.log(`${conn.id ?? 'someone'} is joining the network, telling the rest about it and tell new joiner the member list`)
        this.hostConnectionManager?.broadcastPkg(PkgType.MEMBER_CHANGE, {
          host: this.hostId,
          members: [...this.members, conn.id]
        })
          .catch(this.networkErrorHandler)
        conn.sendPkg(PkgType.SET_STATE, clone(this.state)).catch(this.networkErrorHandler)
      }
    })
    this.hostConnectionManager.on(ConnEvent.CONN_CLOSE, ({ conn }) => {
      this.log(`${conn?.id ?? 'someone'} is leaving the network, telling the rest about it`)
      this.hostConnectionManager?.broadcastPkg(PkgType.MEMBER_CHANGE, {
        host: this.id,
        members: this.members.filter(id => id !== conn?.id)
      })
        .catch(this.networkErrorHandler)
    })
    // if there are existing members, probably the members were connected to a disconnected host
    // so update them to use the new host
    if (this.members.length > 0) {
      this.log('hostConnection trying to connect to all members and tell them to update member list')
      const members = this.members.filter(n => n !== oldHost)
      await Promise.all(members.map(async (id: string): Promise<Connection> => await hostConnection?.connect(id))).catch(console.log)
      await hostConnection.broadcastPkg(PkgType.MEMBER_CHANGE, {
        host: this.id,
        members
      })
      this.log('hostConnection connected to all members')
    }
  }

  private readonly join = async (networkName: string): Promise<void> => {
    this.log('joining network ', networkName)
    this.meToHostConnection = await this.myConnectionManager.connectPrefix(networkName)
    this.log('connected to network')
    this.meToHostConnection.on(ConnEvent.CONN_CLOSE, ({ conn }) => {
      this.log(`lost connection with ${conn?.id ?? 'some peer'}`)
      if (this.members.length > 1) {
        if (this.networkName !== undefined && !this.myConnectionManager.isClosed() && this.members.filter(n => n !== this.hostId)[0] === this.id) {
          this.log('taking over the host role')
          this.host(this.networkName).catch(this.networkErrorHandler)
        }
      }
    })
    this.log('waiting for member list')
    while (this.members.length === 0) {
      await pause(100)
    }
    this.log('received member list, connecting to other members')
    while (!this.members.reduce((flag: boolean, member) => flag && undefined !== this.myConnectionManager.connections.find(({ id }) => id === member), true)) {
      await pause(100)
    }
    this.log('all members connected')
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
    this.log('dispatch', action)
    const queueThisAction = async (): Promise<void> => await new Promise((resolve, reject) => {
      this.requestQueue.push({ action, resolve, reject })
    })
    if (this.activeAction !== undefined) {
      return await queueThisAction()
    }
    this.activeAction = action
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
    let promise = Promise.resolve()
    if (gotValidationErrors.length > 0) {
      this.activeAction = undefined
      await Promise.all(this.members.map(async (id) => await this.myConnectionManager.sendPkg(id, PkgType.CANCEL, {})))
      const filtered = uniq(gotValidationErrors)
      if (filtered.length === 1) {
        error = new Error(filtered[0])
      } else {
        error = new Error(`Multiple Errors: ${filtered.join(',')}`)
      }
    } else if (gotBusyError) {
      this.activeAction = undefined
      await Promise.all(this.members.map(async (id) => await this.myConnectionManager.sendPkg(id, PkgType.CANCEL, {})))
      promise = queueThisAction()
    } else {
      await Promise.all(this.members.map(async (id) => await this.myConnectionManager.sendPkg(id, PkgType.PROMOTE, {})))
      this.activeAction = undefined
    }
    {
      const { action, resolve, reject } = this.requestQueue.shift() ?? {}
      if (action !== undefined && resolve !== undefined && reject !== undefined) {
        this.dispatch(action).then(resolve).catch(reject)
      }
    }
    if (error !== undefined) {
      return await Promise.reject(error)
    }
    return await promise
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
        ack?.(NETWORK_STATE_BUSY_ERROR)
      } else {
        try {
          this.stateStaging = this.reducer(this.state, data as StarMeshAction, conn.id)
          ack?.(true)
        } catch (e: unknown) {
          ack?.((e as Error).message)
        }
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
