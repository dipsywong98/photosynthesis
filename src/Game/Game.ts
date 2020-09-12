import { Room } from '../lib/Room'
import { PkgType } from '../lib/PkgType'
import { Observable } from '../lib/Observable'
import { ConnectionListenerPayload } from '../lib/ConnectionTypes'
import GameWorld from './GameWorld'

export enum GameEvent {
  UPDATE_GAME_STATE,
  REQUEST_GAME_STATE,
  GAME_OVER,
  CLICK,
  GAME_INIT
}

export type Coords = [number, number]

export interface GameState {
  turn: string
  board: Array<Array<string | null>>
}

export interface GameEventPayload {
  data: unknown
}

export class Game extends Observable<typeof GameEvent, GameEventPayload> {
  room: Room
  state: GameState
  gameWorld: GameWorld = new GameWorld()

  constructor (room: Room) {
    super()
    this.room = room
    this.state = this.initGame()
    if (this.room.hostConnectionManager !== undefined) {
      this.initAsHost()
      this.emit(GameEvent.GAME_INIT, { data: undefined })
    }
    if (this.room.myConnectionManager !== undefined) {
      this.initAsPlayer()
    }
    // this.startGame()
  }

  public initGame (): GameState {
    console.log('init game')
    if (this.room.hostPlayerId === undefined) {
      throw new Error('unknown host player')
    }
    this.state = {
      turn: this.room.hostPlayerId,
      board: [
        [null, null, null],
        [null, null, null],
        [null, null, null]
      ]
    }
    return this.state
  }

  public hostBroadcast = async (event: GameEvent, data: unknown): Promise<unknown> => {
    console.log('host broadcast', event, data)
    if (this.room.hostConnectionManager === undefined) {
      throw new Error('i am not host')
    } else {
      return await this.room.hostConnectionManager.broadcastPkg(PkgType.GAME_EVENT, [event, data])
    }
  }

  public hostSend = async (id: string, event: GameEvent, data: unknown): Promise<unknown> => {
    if (this.room.hostConnectionManager === undefined) {
      throw new Error('i am not host')
    } else {
      return await this.room.hostConnectionManager.conn(id).sendPkg(PkgType.GAME_EVENT, [event, data])
    }
  }

  public initAsHost (): void {
    if (this.room.hostConnectionManager !== undefined) {
      this.room.hostConnectionManager.onPkg(PkgType.GAME_EVENT, ({ conn, data, ack }) => {
        const [event, payload] = data as [GameEvent, unknown]
        if (conn !== undefined) {
          const prevState = this.state
          const accepted = this.processEvent(event, payload, conn.id)
          ack?.(accepted)
          // call update game state only if process event change the reference of state
          if (accepted && prevState !== this.state) {
            this.hostBroadcast(GameEvent.UPDATE_GAME_STATE, this.state)
              .then(() => console.log('update state'))
              .catch(console.error)
          }
        } else {
          ack?.(false)
        }
      })
    }
  }

  public processEvent (event: GameEvent, data: unknown, id: string): boolean {
    switch (event) {
      case GameEvent.CLICK: {
        const [x, y] = data as Coords
        console.log('host', this.state)
        if (this.state.board[x][y] === null && this.state.turn === id) {
          this.state.board[x][y] = id === this.room.hostPlayerId ? 'O' : 'X'
          this.state.turn = this.nextPlayerId(this.state.turn)
          this.state = { ...this.state }
          if (x === 0 && y === 0) {
            this.hostBroadcast(GameEvent.GAME_OVER, this.room.hostPlayerId).then(console.log).catch(console.error)
          }
          return true
        } else {
          return false
        }
      }
      case GameEvent.REQUEST_GAME_STATE:
        this.hostSend(id, GameEvent.UPDATE_GAME_STATE, this.state).then(console.log).catch(console.error)
        return true
      default:
        return true
    }
  }

  public initAsPlayer (): void {
    if (this.room.myConnectionManager !== undefined) {
      this.room.myConnectionManager.onPkg(PkgType.GAME_EVENT, ({ data }) => {
        const [event, payload] = data as [GameEvent, unknown]
        console.log('i receive', data)
        if (event === GameEvent.UPDATE_GAME_STATE) {
          this.state = { ...this.state, ...payload as GameState }
        }
        this.emit(event, { data: payload })
      })
      this.send(GameEvent.REQUEST_GAME_STATE, undefined).then(console.log).catch(console.error)
    }
  }

  public async send (event: GameEvent, data: unknown): Promise<ConnectionListenerPayload> {
    return await this.room.sendToHost(PkgType.GAME_EVENT, [event, data])
  }

  public indexOfPlayerId (id: string): number {
    return this.room.playerIds.indexOf(id)
  }

  public nextPlayerId (id: string): string {
    const index = this.indexOfPlayerId(id)
    if (index === -1) {
      return id
    } else {
      return this.room.playerIds[(index + 1) % this.room.playerIds.length]
    }
  }
}
