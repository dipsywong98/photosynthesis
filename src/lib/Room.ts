import { ConnectionManager } from './ConnectionManager'
import { Observable } from './Observable'
import { Game } from '../Game/Game'
import { StarMeshEventPayload, StarMeshNetwork, StarMeshNetworkEvents, StarMeshReducer } from './StarMeshNetwork'
import cloneDeep from 'lodash.clonedeep'

const CH = 'ABCDEFGHJKLMNOPQRSTUVWXYZ'

const generateRoomCode = (): string => {
  return [0, 0, 0, 0].map(() => CH[Math.floor(Math.random() * CH.length)]).join('')
}

enum RoomActionTypes {
  JOIN,
  LEAVE,
  RENAME,
  START_GAME,
  GAME_OVER,
}

export enum RoomEvents {
  SET_PLAYERS,
  SET_HOST,
  START_GAME,
  ERROR,
}

export interface RoomEventPayload {
  data: unknown
}

export interface PlayersDict {
  [id: string]: string
}

interface RoomState<T = unknown> {
  players: PlayersDict
  minPlayers: number
  maxPlayers: number
  game?: T
  idDict?: PlayersDict
  nameDict?: PlayersDict
}

export class Room extends Observable<typeof RoomEvents, RoomEventPayload> {
  network: StarMeshNetwork<RoomState>
  manager: ConnectionManager
  game?: Game

  public get hostPlayerId (): string | undefined {
    return this.network.hostId
  }

  public get roomCode (): string | undefined {
    return this.network.networkName
  }

  public get myId (): string {
    return this.network.id
  }

  public get players (): PlayersDict {
    return this.network.state.players
  }

  public get playerIds (): string[] {
    return Object.keys(this.players)
  }

  /**
   * given peerjs id return in game player id or
   * given in game player id return peerjs id
   * @param id
   */
  public p (id: string | number): string {
    if (this.network.state.idDict === undefined) {
      throw new Error('Game not started yet')
    }
    return this.network.state.idDict[id]
  }

  /**
   *  given name, return in game player id
   * @param name
   */
  public n (name: string): string {
    if (this.network.state.nameDict === undefined) {
      throw new Error('Game not started yet')
    }
    return this.network.state.nameDict[name]
  }

  public get started (): boolean {
    return this.network.state.game !== undefined
  }

  constructor (manager?: ConnectionManager) {
    super()
    this.manager = manager ?? new ConnectionManager()
    this.network = new StarMeshNetwork<RoomState>(this.manager, {
      maxPlayers: 4,
      minPlayers: 2,
      players: {}
    }, this.networkReducer)
    this.network.on(StarMeshNetworkEvents.MEMBERS_LEFT, ({ members }) => {
      if (members !== undefined) {
        members.forEach(id => {
          this.network.dispatchLocal({
            action: RoomActionTypes.LEAVE,
            payload: id
          }).catch(this.errorHandler)
        })
      }
    })
    // this.game = new Game(this)
  }

  public create = async (myName: string, roomCode?: string): Promise<string> => {
    const code = roomCode ?? generateRoomCode()
    await this.join(myName, code)
    return code
  }

  public join = async (myName: string, roomCode: string): Promise<void> => {
    await this.network.joinOrHost(roomCode)
    await this.network.dispatch({
      action: RoomActionTypes.JOIN,
      payload: myName
    }).catch(e => {
      this.leaveRoom()
      throw e
    })
  }

  public joinOrCreate = this.join

  private readonly errorHandler = ({ error }: StarMeshEventPayload<RoomState>): void => {
    console.log(error)
    this.emit(RoomEvents.ERROR, { data: error })
  }

  public rename = async (name: string): Promise<void> => {
    return await this.network.dispatch({
      action: RoomActionTypes.RENAME,
      payload: name
    })
  }

  public leaveRoom = (): void => {
    this.network.leave()
    this.emit(RoomEvents.SET_HOST, { data: undefined })
  }

  public startGame = async (): Promise<void> => {
    const idDict: PlayersDict = {}
    const nameDict: PlayersDict = {}
    Object.entries(this.players).forEach(([id, name], k) => {
      idDict[id] = k.toString()
      idDict[k] = id
      nameDict[name] = k.toString()
    })
    return await this.network.dispatch({
      action: RoomActionTypes.START_GAME,
      payload: {
        idDict,
        nameDict
      }
    })
  }

  private readonly networkReducer: StarMeshReducer<RoomState> = (prevState, { action, payload }, id) => {
    const setName = (): void => {
      if (typeof payload !== 'string') throw new Error('Invalid payload')
      if (this.started) {
        if (this.n(payload) === undefined) {
          throw new Error(`Room '${this.roomCode ?? ''}' has started game`)
        } else if (prevState.idDict !== undefined && prevState.nameDict !== undefined) {
          const pid = this.n(payload)
          prevState.idDict[id] = pid
          prevState.idDict[pid] = id
          prevState.nameDict[payload] = pid
        }
      }
      if (Object.values(prevState.players).includes(payload)) {
        throw new Error(`Name '${payload}' already taken`)
      }
      prevState.players = { ...prevState.players, [id]: payload }
      this.emit(RoomEvents.SET_PLAYERS, {
        data: {
          ...prevState.players
        }
      })
    }
    switch (action) {
      case RoomActionTypes.JOIN:
        if (Object.keys(prevState.players).length + 1 > prevState.maxPlayers) {
          throw new Error(`Room '${this.roomCode ?? ''}' is already full`)
        }
        setName()
        return { ...prevState }
      case RoomActionTypes.RENAME:
        setName()
        return { ...prevState }
      case RoomActionTypes.LEAVE: {
        const { [payload as string]: u, ...players } = this.players
        prevState.players = players
        this.emit(RoomEvents.SET_PLAYERS, {
          data: {
            ...prevState.players
          }
        })
        return { ...prevState }
      }
      case RoomActionTypes.START_GAME: {
        if (this.playerIds.length < this.network.state.minPlayers) {
          throw new Error('Not enough players, required 2')
        }
        const typed = payload as { idDict: PlayersDict, nameDict: PlayersDict }
        prevState.idDict = cloneDeep(typed.idDict)
        prevState.nameDict = cloneDeep(typed.nameDict)
        prevState.game = {}
        this.game?.start()
        this.emit(RoomEvents.START_GAME, { data: this.game })
        return { ...prevState }
      }
      case RoomActionTypes.GAME_OVER: {
        prevState.idDict = undefined
        prevState.nameDict = undefined
        prevState.game = undefined
        return { ...prevState }
      }
    }
    return prevState
  }
}
