import { ConnectionManager } from './ConnectionManager'
import { ConnectionListenerPayload, ConnEvent } from './ConnectionTypes'
import { PkgType } from './PkgType'
import { Connection } from './Connection'
import { Observable } from './Observable'
import { pause } from './pause'
import { Game, GameEvent } from '../Game/Game'

const CH = 'ABCDEFGHJKLMNOPQRSTUVWXYZ'

const generateRoomCode = (): string => {
  return [0, 0, 0, 0].map(() => CH[Math.floor(Math.random() * CH.length)]).join('')
}

export enum RoomEvents {
  SET_PLAYERS,
  SET_HOST,
  START_GAME,
}

export interface RoomEventPayload {
  data: unknown
}

export interface PlayersDict {
  [id: string]: string
}

type JoinEventAckPayload = [PlayersDict, string]

export class Room extends Observable<typeof RoomEvents, RoomEventPayload> {
  myConnectionManager: ConnectionManager
  hostConnectionManager?: ConnectionManager // defined only if i am the host
  meToHostConnection?: Connection
  players: PlayersDict = {}
  hostPlayerId?: string
  roomCode?: string
  game?: Game

  public get playerIds (): string[] {
    return Object.keys(this.players)
  }

  constructor () {
    super()
    this.myConnectionManager = new ConnectionManager()
    this.setUpMyConnectionListener(this.myConnectionManager)
  }

  public sendToHost = async (pkgType: PkgType, data: unknown): Promise<ConnectionListenerPayload> => {
    if (this.meToHostConnection === undefined) {
      throw new Error('not connected to host')
    }
    return await this.myConnectionManager.sendPkg(this.meToHostConnection.id, pkgType, data)
  }

  public broadcast = async (pkgType: PkgType, data: unknown): Promise<ConnectionListenerPayload[]> => {
    return await Promise.all(Object.keys(this.players).map(async (id: string) => await this.myConnectionManager.conn(id).sendPkg(pkgType, data)))
  }

  public get myId (): string {
    return this.myConnectionManager.id
  }

  /**
   * Methods related to hosting a room
   */

  /**
   * create a room to host and join, room name will be random 4 capital letters
   * @param myName
   * @param code
   */
  public create = async (myName: string, code?: string): Promise<string> => {
    if (code !== undefined && code !== '') {
      await this.host(code)
      await this.join(myName, code)
      return code
    } else {
      while (true) {
        const roomCode = generateRoomCode()
        try {
          await this.host(roomCode)
        } catch (e) {
          await pause(100)
          continue
        }
        await this.join(myName, roomCode)
        return roomCode
      }
    }
  }

  /**
   * host a room with given room code
   * create an extra connection manager as a beacon for other peers to join,
   * and notify other roommates that a new peer is joining
   * @param roomCode
   */
  public host = async (roomCode: string): Promise<void> => {
    this.hostConnectionManager = await ConnectionManager.startPrefix(roomCode)
    await this.setUpHostConnectionManagerListeners(this.hostConnectionManager)
    this.hostPlayerId = this.myConnectionManager.id
    this.emit(RoomEvents.SET_HOST, { data: this.hostPlayerId })
  }

  private readonly setUpHostConnectionManagerListeners = async (hostConnection: ConnectionManager): Promise<void> => {
    hostConnection.onPkg(PkgType.JOIN, ({ conn, data, ack }) => {
      if (conn !== undefined) {
        this.players[conn.id] = data as string
        ack?.([this.players, this.myConnectionManager.id]) // return the players list back to the new joiner, and notify the host's player id
        hostConnection?.broadcastPkg(PkgType.NEW_JOIN, [data, conn.id]) // notify other users on the new joiner
          .catch(console.log)
      } else {
        // this is not quite possible
        throw new Error('missing conn')
      }
    })
    hostConnection.on(ConnEvent.CONN_CLOSE, ({ conn }) => {
      if (conn !== undefined) {
        this.removePlayer(conn.id)
      }
    })
    // if there are existing players, probably the players were connected to a disconnected host
    // so update them to use the new host
    if (Object.keys(this.players).length > 0) {
      await Promise.all(Object.keys(this.players).map(async (id: string): Promise<Connection> => await hostConnection?.connect(id)))
      await hostConnection.broadcastPkg(PkgType.CHANGE_HOST, this.myConnectionManager.id)
    }
  }

  /**
   * Methods related to being a room member
   */

  /**
   * join a room
   * @param myName
   * @param roomCode
   */
  public join = async (myName: string, roomCode: string): Promise<Connection[]> => {
    this.meToHostConnection = await this.myConnectionManager.connectPrefix(roomCode) // connect ot the room beacon
    const { data } = await this.sendToHost(PkgType.JOIN, myName)
    const [players, hostId] = data as JoinEventAckPayload
    this.players = players
    this.hostPlayerId = hostId
    this.emit(RoomEvents.SET_PLAYERS, { data: { ...this.players } })
    this.emit(RoomEvents.SET_HOST, { data: hostId })
    this.roomCode = roomCode
    return await Promise.all(Object.keys(players).map(async (id): Promise<Connection> => await this.myConnectionManager.connect(id))) // connect to rest of the players to form mesh
  }

  private readonly setUpMyConnectionListener = (myConnection: ConnectionManager): void => {
    // triggered when other enter the room
    myConnection.onPkg(PkgType.NEW_JOIN, ({ data }) => {
      const [name, id] = data as [string, string]
      myConnection.connect(id)
        .catch(console.log)
      this.players[id] = name
      this.emit(RoomEvents.SET_PLAYERS, { data: { ...this.players } })
    })
    myConnection.on(ConnEvent.CONN_CLOSE, ({ conn }) => {
      if (conn !== undefined) {
        if (conn.id in this.players) {
          this.removePlayer(conn.id)
        } else if (this.hostPlayerId !== undefined && conn.id === this.meToHostConnection?.id) {
          this.handleHostClosed(myConnection)
        }
        this.emit(RoomEvents.SET_PLAYERS, { data: { ...this.players } })
      }
    })
    myConnection.onPkg(PkgType.RENAME, ({ data }) => {
      const [name, id] = data as [string, string]
      this.players[id] = name
      this.emit(RoomEvents.SET_PLAYERS, { data: { ...this.players } })
    })
    myConnection.onPkg(PkgType.START_GAME, () => {
      const game = new Game(this)
      game.on(GameEvent.GAME_OVER, () => {
        this.game = undefined
      })
      this.emit(RoomEvents.START_GAME, { data: game })
    })
  }

  private readonly handleHostClosed = (myConnection: ConnectionManager): void => {
    if (this.myConnectionManager.isClosed()) {
      return
    }
    if (this.hostPlayerId !== undefined) {
      this.removePlayer(this.hostPlayerId)
    }
    if (this.meToHostConnection !== undefined) {
      myConnection.untilPkg(PkgType.CHANGE_HOST).then(async ({ data }) => {
        this.emit(RoomEvents.SET_HOST, { data })
        this.meToHostConnection = await myConnection.connect(data as string)
      })
        .catch(console.log)
      if (Object.keys(this.players)[0] === myConnection.id && this.roomCode !== undefined) {
        this.host(this.roomCode)
          .catch(console.log)
      }
    }
  }

  public rename = async (name: string): Promise<ConnectionListenerPayload[]> => {
    return await this.broadcast(PkgType.RENAME, [this.myId, name])
  }

  public leaveRoom = (): void => {
    this.myConnectionManager.close()
    this.myConnectionManager = new ConnectionManager()
    if (this.hostConnectionManager !== undefined) {
      this.hostConnectionManager?.close()
    }
    this.setUpMyConnectionListener(this.myConnectionManager)
    this.hostConnectionManager = undefined
    this.meToHostConnection?.close()
    this.meToHostConnection = undefined
    this.players = {}
    this.hostPlayerId = undefined
    this.roomCode = undefined
    this.emit(RoomEvents.SET_HOST, { data: undefined })
    this.emit(RoomEvents.SET_PLAYERS, { data: {} })
  }

  public startGame = async (): Promise<ConnectionListenerPayload[]> => {
    return await this.broadcast(PkgType.START_GAME, undefined)
  }

  private removePlayer (playerId: string): void {
    const { [playerId]: s, ...rest } = this.players
    this.players = rest
  }
}
