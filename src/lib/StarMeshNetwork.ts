import { ConnectionManager } from './ConnectionManager'
import { ConnectionListenerPayload, ConnEvent } from './ConnectionTypes'
import { PkgType } from './PkgType'
import { Connection } from './Connection'
import { Observable } from './Observable'

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

export type StarMeshReducer = <T>(prevState: T, action: StarMeshAction) => T

interface MemberChangePayload {
  members: string[]
  host: string
}

const idMemberChangePayload = (data: unknown): data is MemberChangePayload => {
  if (typeof data === 'object' && data !== null) {
    if ('members' in data && 'host' in data) {
      const d = data as { members: unknown, host: unknown }
      return typeof d.host === 'string' && Array.isArray(d.members) && d.members.reduce((p: boolean, c) => p && typeof c === 'string', true)
    }
  }
  return false
}

export class StarMeshNetwork<T> extends Observable<typeof StarMeshNetworkEvents, StarMeshEventPayload<T>> {
  hostConnectionManager?: ConnectionManager
  myConnectionManager: ConnectionManager
  meToHostConnection?: Connection
  members: string[] = []

  state: T
  networkName?: string

  reducer?: StarMeshReducer
  hostId?: string
  initialState: T

  public get id (): string {
    return this.myConnectionManager.id
  }

  constructor (myConnectionManager: ConnectionManager, initialState: T, reducer?: StarMeshReducer) {
    super()
    this.reducer = reducer
    this.initialState = Object.freeze(initialState)
    this.myConnectionManager = myConnectionManager
    this.initMyConnectionManagerListeners()
    this.state = { ...initialState }
  }

  private readonly networkErrorHandler = (error: Error): void => {
    console.log(this.id, error)
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
  }

  public async joinOrHost (networkName: string): Promise<void> {
    this.networkName = networkName
    try {
      await this.host(networkName)
      await this.join(networkName)
    } catch (e) {
      await this.join(networkName)
    }
  }

  private readonly host = async (networkName: string): Promise<void> => {
    const hostConnection = await ConnectionManager.startPrefix(networkName)
    this.hostId = this.id
    this.hostConnectionManager = hostConnection
    this.hostConnectionManager.on(ConnEvent.CONN_OPEN, ({ conn }) => {
      if (conn !== undefined) {
        this.hostConnectionManager?.broadcastPkg(PkgType.MEMBER_CHANGE, {
          host: this.hostId,
          members: [...this.members, conn.id]
        })
          .catch(this.networkErrorHandler)
        conn.sendPkg(PkgType.SET_STATE, this.state).catch(this.networkErrorHandler)
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
      await Promise.all(this.members.map(async (id: string): Promise<Connection> => await hostConnection?.connect(id)))
    }
  }

  private readonly join = async (networkName: string): Promise<void> => {
    const refreshMembersPromise = this.myConnectionManager.untilPkg(PkgType.MEMBER_CHANGE)
    this.meToHostConnection = await this.myConnectionManager.connectPrefix(networkName)
    this.meToHostConnection.on(ConnEvent.CONN_CLOSE, () => {
      this.members = this.members.filter(n => n !== this.hostId)
      if (!this.myConnectionManager.isClosed() && this.members[0] === this.id) {
        this.host(networkName).catch(this.networkErrorHandler)
      }
    })
    const { data } = await refreshMembersPromise
    await this.handleMemberChange(data)
  }

  private readonly handleMemberChange = async (data: unknown): Promise<void> => {
    if (idMemberChangePayload(data)) {
      if (this.hostId !== data.host) {
        this.emit(StarMeshNetworkEvents.HOST_CHANGE, { host: data.host })
      }
      if (data.members.length === this.members.length && this.members.reduce((f: boolean, c) => f && data.members.includes(c), true)) {
        return
      }
      this.hostId = data.host
      const oldList = [...this.members]
      const newList = data.members
      this.members = [...newList]
      // connect to new member
      const memberJoining = newList.filter(n => !oldList.includes(n))
      await Promise.all(memberJoining.map(async n => {
        return await this.myConnectionManager.connect(n)
      }))
      // disconnect leave member
      const memberLeaving = oldList.filter(n => !newList.includes(n))
      memberLeaving.forEach(n => {
        this.myConnectionManager.disconnect(n)
      })
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

  public setReducer = (reducer: StarMeshReducer): void => {
    this.reducer = reducer
  }

  public dispatch = async (action: StarMeshAction): Promise<void> => {
    const responses = await this.myConnectionManager.broadcastPkg(PkgType.DISPATCH, action)
    responses.forEach(({ data }) => {
      if (data !== undefined && data !== true) {
        throw data
      }
    })
  }

  private readonly dispatchHandler = ({ data, ack }: ConnectionListenerPayload): void => {
    if (this.reducer === undefined) {
      this.emit(StarMeshNetworkEvents.NETWORK_ERROR, { error: new Error('no reducer defined') })
      ack?.('no reducer defined')
    } else {
      try {
        const stateStaging = this.reducer(this.state, data as StarMeshAction)
        this.setState(stateStaging)
        ack?.(true)
      } catch (e: unknown) {
        ack?.((e as Error).message)
      }
    }
  }

  private readonly setState = (newState: T): void => {
    this.emit(StarMeshNetworkEvents.STATE_CHANGE, { state: newState })
    this.state = newState
  }

  public leave = (): void => {
    this.meToHostConnection?.close()
    this.hostConnectionManager?.destroy()
    this.meToHostConnection = undefined
    this.hostConnectionManager = undefined
    this.state = { ...this.initialState }
    this.networkName = undefined
    this.members = []
    this.hostId = undefined
  }
}
