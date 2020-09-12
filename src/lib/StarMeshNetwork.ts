import { ConnectionManager } from './ConnectionManager'
import { ConnectionListenerPayload, ConnEvent } from './ConnectionTypes'
import { PkgType } from './PkgType'
import { Connection } from './Connection'
import { Observable } from './Observable'

export enum StarMeshNetworkEvents {
  STATE_CHANGE
}

export type StarMeshAction = Record<string, unknown>

export type StarMeshReducer = <T>(prevState: T, action: StarMeshAction) => T

export class StarMeshNetwork<T> extends Observable<typeof StarMeshNetworkEvents, T> {
  hostConnectionManager?: ConnectionManager
  myConnectionManager: ConnectionManager
  meToHostConnection?: Connection
  members: string[] = []

  state: T
  networkName?: string

  reducer?: StarMeshReducer

  public get id (): string {
    return this.myConnectionManager.id
  }

  constructor (myConnectionManager: ConnectionManager, initialState: T) {
    super()
    this.myConnectionManager = myConnectionManager
    this.initMyConnectionManagerListeners()
    this.state = initialState
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
      console.log(this.id, 'member change', data)
      this.connectMembers(data)
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
    this.hostConnectionManager = hostConnection
    this.hostConnectionManager.on(ConnEvent.CONN_OPEN, ({ conn }) => {
      if (conn !== undefined) {
        console.log('broadcase member change', [...this.members, conn.id])
        this.hostConnectionManager?.broadcastPkg(PkgType.MEMBER_CHANGE, [...this.members, conn.id])
          .catch(console.log)
      }
    })
    // if there are existing members, probably the members were connected to a disconnected host
    // so update them to use the new host
    if (Object.keys(this.members).length > 0) {
      await Promise.all(Object.keys(this.members).map(async (id: string): Promise<Connection> => await hostConnection?.connect(id)))
    }
  }

  private readonly join = async (networkName: string): Promise<void> => {
    const refreshMembersPromise = this.myConnectionManager.untilPkg(PkgType.MEMBER_CHANGE)
    this.meToHostConnection = await this.myConnectionManager.connectPrefix(networkName)
    this.meToHostConnection.on(ConnEvent.CONN_CLOSE, ({ conn }) => {
      if (conn !== undefined) {
        this.removeMember(conn.id)
      }
    })
    const { data } = await refreshMembersPromise
    this.connectMembers(data)
  }

  private readonly connectMembers = (data: unknown): void => {
    if (Array.isArray(data) && data.reduce((d: boolean, dd) => d && typeof dd === 'string', true)) {
      const newList = data as string[]
      // connect to new member
      newList.filter(n => !this.members.includes(n)).map(async n => {
        return await this.myConnectionManager.connect(n)
      })
      // disconnect leave member
      this.members.filter(n => !newList.includes(n)).forEach(n => {
        this.myConnectionManager.disconnect(n)
      })
      console.log(this.id, 'set members', newList)
      this.members = [...newList]
    } else {
      console.log(data)
      throw new Error('wrong list')
    }
  }

  private readonly removeMember = (id: string): void => {
    this.members = this.members.filter(_id => _id !== id)
  }

  public setReducer = (reducer: StarMeshReducer): void => {
    this.reducer = reducer
  }

  public dispatch = async (action: StarMeshAction): Promise<void> => {
    const responses = await this.myConnectionManager.broadcastPkg(PkgType.DISPATCH, action)
    console.log(responses)
    responses.forEach(({ data }) => {
      if (data !== undefined && data !== true) {
        throw data
      }
    })
  }

  private readonly dispatchHandler = ({ data, ack }: ConnectionListenerPayload): void => {
    try {
      const stateStaging = this.reducer?.(this.state, data as StarMeshAction) ?? this.state
      this.setState(stateStaging)
      ack?.(true)
    } catch (e: unknown) {
      ack?.((e as Error).message)
    }
  }

  private readonly setState = (newState: T): void => {
    this.emit(StarMeshNetworkEvents.STATE_CHANGE, newState)
    this.state = newState
  }
}
