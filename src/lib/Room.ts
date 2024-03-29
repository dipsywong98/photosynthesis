import { ConnectionManager } from './ConnectionManager'
import { Observable } from './Observable'
import { Game } from '../Game/Game'
import { StarMeshEventPayload, StarMeshNetwork, StarMeshNetworkEvents, StarMeshReducer } from './StarMeshNetwork'
import { clone } from 'ramda'
import { GameState } from '../Game/types/GameState'

const CH = 'ABCDEFGHJKLMNOPQRSTUVWXYZ'

const generateRoomCode = (): string => {
  return [0, 0, 0, 0].map(() => CH[Math.floor(Math.random() * CH.length)]).join('')
}

export enum RoomActionTypes {
  JOIN,
  LEAVE,
  RENAME,
  START_GAME,
  END_GAME,
  GAME_EVENT,
}

export enum RoomEvents {
  SET_PLAYERS,
  SET_HOST,
  START_GAME,
  ERROR,
  END_GAME,
  LEAVE_ROOM,
}

export interface RoomEventPayload {
  data: unknown
}

export interface PlayersDict {
  [id: string]: string
}

export interface RoomState {
  players: PlayersDict
  minPlayers: number
  maxPlayers: number
  game?: GameState
  idDict?: PlayersDict
  nameDict?: PlayersDict
}

const initialState = Object.freeze({
  maxPlayers: 4,
  minPlayers: 2,
  players: {}
})

export class Room extends Observable<typeof RoomEvents, RoomEventPayload> {
  network: StarMeshNetwork<RoomState>
  manager: ConnectionManager
  game: Game

  public get state (): RoomState {
    return this.network.state
  }

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
    return this.state.players
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
    if (this.state.idDict === undefined) {
      console.trace('Game not started yet')
      throw new Error('Game not started yet')
    }
    return this.state.idDict[id]
  }

  /**
   * given conn id return in game player id in integer
   * @param id
   */
  public pi (id: string): number {
    if (this.state.idDict === undefined) {
      console.trace('Game not started yet')
      throw new Error('Game not started yet')
    }
    return Number.parseInt(this.state.idDict[id])
  }

  /**
   *  given name, return in game player id
   * @param name
   */
  public n (name: string): string {
    if (this.state.nameDict === undefined) {
      console.trace('Game not started yet')
      throw new Error('Game not started yet')
    }
    return this.state.nameDict[name]
  }

  /**
   * Given game player id, return name
   * @param id
   */
  public whoami (id: string): string {
    if (this.state.idDict === undefined) {
      console.trace('Game not started yet')
      throw new Error('Game not started yet')
    }
    const idDictElement = this.state.idDict[id]
    if (idDictElement === undefined) {
      throw new Error(`Id ${id} not in game`)
    }
    return this.state.players[idDictElement]
  }

  public get started (): boolean {
    return this.state.game !== undefined && this.state.game.gameOver === undefined
  }

  public static getName (roomState: RoomState, id: number): string {
    if (roomState.idDict !== undefined && roomState.players !== undefined) {
      return roomState.players[roomState.idDict[id]]
    } else {
      return ''
    }
  }

  constructor (manager?: ConnectionManager) {
    super()
    this.manager = manager ?? new ConnectionManager()
    this.network = new StarMeshNetwork<RoomState>(this.manager, clone(initialState), this.networkReducer)
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
    this.network.on(StarMeshNetworkEvents.HOST_CHANGE, ({ host }) => {
      if (host !== undefined) {
        this.emit(RoomEvents.SET_HOST, { data: host })
      }
    })
    this.game = new Game(this)
  }

  public create = async (myName: string, roomCode?: string): Promise<string> => {
    const code = roomCode === undefined || roomCode === '' ? generateRoomCode() : roomCode
    await this.join(myName, code)
    return code
  }

  public join = async (myName: string, roomCode: string): Promise<void> => {
    if (roomCode === '') {
      throw new Error('Room name is required')
    }
    console.log(`joining ${roomCode}`)
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
    this.emit(RoomEvents.LEAVE_ROOM, { data: undefined })
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

  public endGame = async (message: string): Promise<void> => {
    return await this.network.dispatch({
      action: RoomActionTypes.END_GAME,
      payload: message
    })
  }

  private readonly networkReducer: StarMeshReducer<RoomState> = (prevState, { action, payload }, connId) => {
    const setName = (): void => {
      if (typeof payload !== 'string') throw new Error('Invalid payload')
      if (this.started) {
        if (this.n(payload) === undefined) {
          throw new Error(`Room '${this.roomCode ?? ''}' has started game`)
        } else if (prevState.idDict !== undefined && prevState.nameDict !== undefined) {
          const pid = this.n(payload)
          prevState.idDict[connId] = pid
          prevState.idDict[pid] = connId
          prevState.nameDict[payload] = pid
        }
      }
      if (Object.values(prevState.players).includes(payload)) {
        throw new Error(`Name '${payload}' already taken`)
      }
      prevState.players = { ...prevState.players, [connId]: payload }
      this.emit(RoomEvents.SET_PLAYERS, {
        data: {
          ...prevState.players
        }
      })
      if (prevState.game !== undefined) {
        this.game.rejoin(prevState.game)
      }
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
        if (this.playerIds.length < this.state.minPlayers) {
          throw new Error('Not enough players, required 2')
        }
        const typed = payload as { idDict: PlayersDict, nameDict: PlayersDict }
        prevState.game = Game.initialState(this.playerIds.length)
        prevState.idDict = clone(typed.idDict)
        prevState.nameDict = clone(typed.nameDict)
        this.game?.start(prevState.game)
        this.emit(RoomEvents.START_GAME, { data: this.game })
        return { ...prevState }
      }
      case RoomActionTypes.END_GAME: {
        prevState.idDict = undefined
        prevState.nameDict = undefined
        if (prevState.game !== undefined) {
          prevState.game.gameOver = payload as string
        }
        this.game.stop(payload)
        this.emit(RoomEvents.END_GAME, { data: payload })
        return { ...prevState }
      }
      case RoomActionTypes.GAME_EVENT: {
        if (this.started && prevState.game !== undefined) {
          if (prevState.game.gameOver !== undefined) {
            throw new Error('Game over')
          }
          try {
            prevState.game = this.game?.reducer(prevState.game, payload as Record<string, unknown>, connId)
          } catch (e) {
            console.trace(e)
            throw e
          }
          return { ...prevState }
        } else {
          throw new Error('Game not started')
        }
      }
    }
    return prevState
  }
}
