import {ConnectionManager} from './ConnectionManager'
import {ConnEvent} from './ConnectionTypes'
import {PkgType} from './PkgType'
import {Connection} from './Connection'
import {Observable} from './Observable'

const CH = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'

const generateRoomCode = () => {
  return [0, 0, 0, 0].map(() => CH[Math.floor(Math.random() * CH.length)]).join('')
}

export enum RoomEvents {
  SET_PLAYERS,
  CHANGE_HOST,
}

export class Room extends Observable {
  myConnection: ConnectionManager
  hostConnection?: ConnectionManager
  hostConn?: Connection
  players: { [id: string]: string } = {}
  hostId?: string
  roomCode?: string

  constructor(myConnection: ConnectionManager) {
    super()
    this.myConnection = myConnection
  }

  public async sendHost(pkgType: PkgType, data: any) {
    if (this.hostConn === undefined) {
      throw new Error('not connected to host')
    }
    return this.myConnection.sendPkg(this.hostConn.id, pkgType, data)
  }

  public async create(myName: string) {
    while (true) {
      const roomCode = generateRoomCode()
      try {
        await this.myConnection.connectPrefix(roomCode)
        this.myConnection.conn(roomCode).close()
      } catch (e) {
        await this.host(roomCode)
        await this.join(myName, roomCode)
        return roomCode
      }
    }
    // this.myConnection.connect(ConnectionManager.prefixId(roomName+'host')).then(()).catch(this.hostRoom(roomName))
  }

  public async host(roomCode: string) {
    console.log('host prepare ', roomCode)
    this.hostConnection = ConnectionManager.withPrefix(roomCode)
    await this.setUpHostConnectionListeners(this.hostConnection)
    this.hostId = this.myConnection.id
    console.log('host done ', roomCode)
  }

  private async setUpHostConnectionListeners(hostConnection: ConnectionManager) {
    hostConnection.onPkg(PkgType.JOIN, ({conn, data, ack}) => {
      console.log('on join')
      if (conn !== undefined) {
        console.log(ack)
        this.players[conn.id] = data
        ack?.([this.players, this.myConnection.id])
        conn?.sendPkg(PkgType.PLAYERS, this.players)
        hostConnection?.broadcastPkg(PkgType.NEW_JOIN, [data, conn.id])
      }else{
        throw new Error('missing conn')
      }
    })
    hostConnection.on(ConnEvent.CONN_CLOSE, ({conn}) => {
      if (conn) {
        delete this.players[conn.id]
      }
    })
    await hostConnection.until(ConnEvent.PEER_OPEN)
    if (Object.keys(this.players).length > 0) {
      await Promise.all(Object.keys(this.players).map((id: string) => hostConnection?.connect(id)))
      await hostConnection.broadcastPkg(PkgType.CHANGE_HOST, this.myConnection.id)
    }
  }

  public async join(myName: string, roomCode: string) {
    console.log('join', myName, roomCode)
    this.hostConn = await this.myConnection.connectPrefix(roomCode)
    this.setUpMyConnectionListener(this.myConnection)
    // this.myConnection.onMatch(ConnEvent.CONN_CLOSE, ({conn}: ConnectionListenerPayload) => conn?.id === this.hostConn, () => {
    //
    // })
    console.log('send join')
    const {data: [players, hostId]} = await this.sendHost(PkgType.JOIN, myName)//.then(d => console.log('acked data', d))
    // console.log('sent join')
    // const {data} = await this.myConnection.untilPkg(PkgType.PLAYERS)
    console.log('join received ', players, hostId)
    this.players = players
    this.hostId = hostId
    this.emit(RoomEvents.SET_PLAYERS, {...this.players})
    this.roomCode = roomCode
    return Promise.all(Object.keys(players).map((id) => this.myConnection.connect(id)))
  }

  private setUpMyConnectionListener(myConnection: ConnectionManager) {
    myConnection.onPkg(PkgType.NEW_JOIN, ({data: [name, id]}) => {
      console.log('new join', [name, id])
      myConnection.connect(id)
      this.players[id] = name
      this.emit(RoomEvents.SET_PLAYERS, {...this.players})
    })
    myConnection.on(ConnEvent.CONN_CLOSE, ({conn}) => {
      if (conn) {
        if (conn.id in this.players) {
          delete this.players[conn.id]
        } else if (this.hostId && conn.id === this.hostConn?.id) {
          delete this.players[this.hostId]
          console.log('host closed', this.hostConn)
          if (this.hostConn) {
            myConnection.untilPkg(PkgType.CHANGE_HOST).then(async ({data}) => {
              this.hostConn = await myConnection.connect(data)
            })
            console.log(Object.keys(this.players), myConnection.id)
            if (Object.keys(this.players)[0] === myConnection.id && this.roomCode) {
              this.host(this.roomCode)
            }
          }
        }
        this.emit(RoomEvents.SET_PLAYERS, {...this.players})
      }
    })
  }
}
