import {ConnectionManager} from './ConnectionManager'
import {ConnEvent} from './ConnectionTypes'
import {PkgType} from './PkgType'
import {Connection} from './Connection'
import {Observable} from './Observable'
import {pause} from './pause'

const CH = 'ABCDEFGHJKLMNOPQRSTUVWXYZ'

const generateRoomCode = () => {
  return [0, 0, 0, 0].map(() => CH[Math.floor(Math.random() * CH.length)]).join('')
}

export enum RoomEvents {
  SET_PLAYERS,
  CHANGE_HOST,
}

export class Room extends Observable {
  myConnectionManager: ConnectionManager
  hostConnectionManager?: ConnectionManager  // defined only if i am the host
  meToHostConnection?: Connection
  players: { [id: string]: string } = {}
  hostPlayerId?: string
  roomCode?: string

  constructor(myConnection: ConnectionManager) {
    super()
    this.myConnectionManager = myConnection
    this.setUpMyConnectionListener(this.myConnectionManager)
  }

  public async sendToHost(pkgType: PkgType, data: any) {
    if (this.meToHostConnection === undefined) {
      throw new Error('not connected to host')
    }
    return this.myConnectionManager.sendPkg(this.meToHostConnection.id, pkgType, data)
  }

  /**
   * Methods related to hosting a room
   */

  /**
   * create a room to host and join, room name will be random 4 capital letters
   * @param myName
   */
  public async create(myName: string) {
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

  /**
   * host a room with given room code
   * create an extra connection manager as a beacon for other peers to join,
   * and notify other roommates that a new peer is joining
   * @param roomCode
   */
  public async host(roomCode: string) {
    this.hostConnectionManager = await ConnectionManager.startPrefix(roomCode)
    await this.setUpHostConnectionManagerListeners(this.hostConnectionManager)
    this.hostPlayerId = this.myConnectionManager.id
  }

  private async setUpHostConnectionManagerListeners(hostConnection: ConnectionManager) {
    hostConnection.onPkg(PkgType.JOIN, ({conn, data, ack}) => {
      if (conn !== undefined) {
        this.players[conn.id] = data
        ack?.([this.players, this.myConnectionManager.id]) // return the players list back to the new joiner, and notify the host's player id
        hostConnection?.broadcastPkg(PkgType.NEW_JOIN, [data, conn.id]) // notify other users on the new joiner
      } else {
        // this is not quite possible
        throw new Error('missing conn')
      }
    })
    hostConnection.on(ConnEvent.CONN_CLOSE, ({conn}) => {
      if (conn) {
        delete this.players[conn.id]
      }
    })
    // if there are existing players, probably the players were connected to a disconnected host
    // so update them to use the new host
    if (Object.keys(this.players).length > 0) {
      await Promise.all(Object.keys(this.players).map((id: string) => hostConnection?.connect(id)))
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
  public async join(myName: string, roomCode: string) {
    this.meToHostConnection = await this.myConnectionManager.connectPrefix(roomCode)  // connect ot the room beacon
    const {data: [players, hostId]} = await this.sendToHost(PkgType.JOIN, myName)
    this.players = players
    this.hostPlayerId = hostId
    this.emit(RoomEvents.SET_PLAYERS, {...this.players})
    this.roomCode = roomCode
    return Promise.all(Object.keys(players).map((id) => this.myConnectionManager.connect(id)))  // connect to rest of the players to form mesh
  }

  private setUpMyConnectionListener(myConnection: ConnectionManager) {
    // triggered when other enter the room
    myConnection.onPkg(PkgType.NEW_JOIN, ({data: [name, id]}) => {
      myConnection.connect(id)
      this.players[id] = name
      this.emit(RoomEvents.SET_PLAYERS, {...this.players})
    })
    myConnection.on(ConnEvent.CONN_CLOSE, ({conn}) => {
      if (conn) {
        if (conn.id in this.players) {
          delete this.players[conn.id]
        } else if (this.hostPlayerId && conn.id === this.meToHostConnection?.id) {
          this.handleHostClosed(myConnection)
        }
        this.emit(RoomEvents.SET_PLAYERS, {...this.players})
      }
    })
  }

  private handleHostClosed(myConnection: ConnectionManager) {
    if(this.hostPlayerId){
      delete this.players[this.hostPlayerId]
    }
    if (this.meToHostConnection) {
      myConnection.untilPkg(PkgType.CHANGE_HOST).then(async ({data}) => {
        this.emit(RoomEvents.CHANGE_HOST, data)
        this.meToHostConnection = await myConnection.connect(data)
      })
      if (Object.keys(this.players)[0] === myConnection.id && this.roomCode) {
        this.host(this.roomCode)
      }
    }
  }
}
