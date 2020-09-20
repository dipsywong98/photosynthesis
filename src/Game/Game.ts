import { Room, RoomActionTypes } from '../lib/Room'
import { Observable } from '../lib/Observable'
import GameWorld from './GameWorld'
import { StarMeshAction, StarMeshNetworkEvents, StarMeshReducer } from '../lib/StarMeshNetwork'
import { GameState } from './types/GameState'
import { getInitialState } from './getInitialState'

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

export interface GameEventPayload {
  data: unknown
}

export class Game extends Observable<typeof GameEvent, GameEventPayload> {
  room: Room
  gameWorld = new GameWorld()

  public get started (): boolean {
    return this.room.started
  }

  public get state (): GameState | undefined {
    return this.room.network.state.game
  }

  public static initialState (players: number): GameState {
    return getInitialState(players)
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
    this.room.network.on(StarMeshNetworkEvents.STATE_CHANGE, ({ state }) => {
      this.emit(GameEvent.UPDATE_GAME_STATE, { data: state?.game })
    })
  }

  public start (): void {
    // this.gameWorld.resetWorld()
  }

  public stop (payload: unknown): void {
    this.emit(GameEvent.GAME_OVER, { data: payload })
    // this.gameWorld.dispose()
  }

  public async click (x: number, y: number): Promise<void> {
    return await this.dispatch({
      action: GameActions.CLICK,
      payload: [x, y]
    }).catch(this.errorHandler)
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
    // const pid = this.room.pi(connId)
    switch (action) {
      case GameActions.CLICK: {
        // const [x, y] = payload as Coords
      }
    }
    return prevState
  }
}
