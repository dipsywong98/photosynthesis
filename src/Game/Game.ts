import { Room, RoomActionTypes } from '../lib/Room'
import { Observable } from '../lib/Observable'
import GameWorld from './GameWorld'
import { StarMeshAction, StarMeshReducer } from '../lib/StarMeshNetwork'

export enum GameEvent {
  UPDATE_GAME_STATE,
  REQUEST_GAME_STATE,
  GAME_OVER,
  CLICK,
  GAME_INIT
}

export enum GameActions {
  CLICK
}

export type Coords = [number, number]

export interface GameState {
  turn: number
  board: Array<Array<string | null>>
}

export interface GameEventPayload {
  data: unknown
}

export class Game extends Observable<typeof GameEvent, GameEventPayload> {
  room: Room
  gameWorld: GameWorld = new GameWorld()

  public get state (): GameState {
    if (this.room.network.state.game === undefined) {
      throw new Error('Cannot get state before started')
    }
    return this.room.network.state.game
  }

  public static get initialState (): GameState {
    return {
      turn: 0,
      board:
        [
          [null, null, null],
          [null, null, null],
          [null, null, null]
        ]
    }
  }

  public get me (): string {
    return this.room.p(this.room.myId)
  }

  public get mi (): number {
    return Number.parseInt(this.me)
  }

  constructor (room: Room) {
    super()
    this.room = room
  }

  public start (): void {
    //
  }

  public async click (x: number, y: number): Promise<void> {
    return await this.dispatch({
      action: GameActions.CLICK,
      payload: [x, y]
    })
  }

  public dispatch = async (action: StarMeshAction): Promise<void> => {
    await this.room.network.dispatch({
      action: RoomActionTypes.GAME_EVENT,
      payload: action
    })
  }

  public errorHandler = (e: Error): void => {
    console.log(e)
  }

  public reducer: StarMeshReducer<GameState> = (prevState, { action, payload }, connId) => {
    const pid = this.room.pi(connId)
    switch (action) {
      case GameActions.CLICK: {
        const [x, y] = payload as Coords
        if (prevState.board[x][y] === null && prevState.turn === pid) {
          prevState.board[x][y] = connId === '0' ? 'O' : 'X'
          prevState.turn = 1 - prevState.turn
          if (x === 0 && y === 0) {
            this.room.endGame(connId).catch(this.errorHandler)
          }
          return { ...prevState }
        } else {
          throw new Error('invalid move')
        }
      }
    }
    return prevState
  }
}
