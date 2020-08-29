import {Room} from '../lib/Room'
import {PkgType} from '../lib/PkgType'
import {Observable} from '../lib/Observable'

export enum GameEvent {
  UPDATE_GAME_STATE,
  REQUEST_GAME_STATE,
  GAME_OVER,
  CLICK
}

export class Game extends Observable {
  room: Room
  state: any

  constructor(room: Room) {
    super()
    this.room = room
    if (this.room.hostConnectionManager) {
      this.initAsHost()
      this.initGame()
    }
    if (this.room.myConnectionManager) {
      this.initAsPlayer()
    }
    // this.startGame()
  }

  public initGame() {
    console.log('init game')
    this.state = {
      turn: this.room.hostPlayerId,
      board: [
        [null, null, null],
        [null, null, null],
        [null, null, null]
      ]
    }
    return this.hostBroadcast(GameEvent.UPDATE_GAME_STATE, this.state)
  }

  public hostBroadcast = (event: GameEvent, data: any) => {
    console.log('host broadcast', event, data)
    return Promise.resolve(this.room.hostConnectionManager?.broadcastPkg(PkgType.GAME_EVENT, [event, data]))
  }

  public hostSend = (id: string, event: GameEvent, data: any) => {
    return Promise.resolve(this.room.hostConnectionManager?.conn(id).sendPkg(PkgType.GAME_EVENT, [event, data]))
  }

  public initAsHost() {
    if (this.room.hostConnectionManager) {
      this.room.hostConnectionManager.onPkg(PkgType.GAME_EVENT, async ({conn, data: [event, data], ack}) => {
        if (conn) {
          const prevState = this.state
          const accepted = this.processEvent(event, data, conn.id)
          ack?.(accepted)
          if (accepted && prevState !== this.state) {
            await this.hostBroadcast(GameEvent.UPDATE_GAME_STATE, this.state)
          }
        } else {
          ack?.(false)
        }
      })
    }
  }

  public processEvent(event: GameEvent, data: any, id: string): boolean {
    switch (event) {
      case GameEvent.CLICK: {
        const [x, y] = data
        console.log('host', this.state)
        if (this.state.board[x][y] === null && this.state.turn === id) {
          this.state.board[x][y] = id === this.room.hostPlayerId ? 'O' : 'X'
          this.state.turn = this.nextPlayerId(this.state.turn)
          this.state = {...this.state}
          if (x === 0 && y === 0) {
            this.hostBroadcast(GameEvent.GAME_OVER, this.room.hostPlayerId)
          }
          return true
        } else {
          return false
        }
      }
      case GameEvent.REQUEST_GAME_STATE:
        this.hostSend(id, GameEvent.UPDATE_GAME_STATE, this.state)
        return true
      default:
        return true
    }
  }


  public initAsPlayer() {
    if (this.room.myConnectionManager) {
      this.room.myConnectionManager.onPkg(PkgType.GAME_EVENT, ({data}) => {
        console.log('i receive', data)
        if (data[0] === GameEvent.UPDATE_GAME_STATE) {
          this.state = {...this.state, ...data[1]}
        }
        this.emit(data[0], data[1])
      })
      this.send(GameEvent.REQUEST_GAME_STATE, undefined)
    }
  }

  public send(event: GameEvent, data: any): Promise<any> {
    return this.room.sendToHost(PkgType.GAME_EVENT, [event, data])
  }

  public indexOfPlayerId(id: string) {
    return this.room.playerIds.indexOf(id)
  }

  public nextPlayerId(id: string) {
    const index = this.indexOfPlayerId(id)
    if (index === -1) {
      return id
    } else {
      return this.room.playerIds[(index + 1) % this.room.playerIds.length]
    }
  }
}
