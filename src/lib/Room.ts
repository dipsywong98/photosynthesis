import {ConnectionManager} from './ConnectionManager'
import {ConnEvent} from './ConnectionTypes'
import {PkgType} from './PkgType'
import {Connection} from './Connection'
import {Observable} from './Observable'

const CH = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'

const generateRoomCode = () => {
  return [0,0,0,0].map(() => CH[Math.floor(Math.random() * CH.length)]).join('')
}

export enum RoomEvents {
  SET_PLAYERS
}

export class Room extends Observable{
  myConnection: ConnectionManager
  hostConnection?: ConnectionManager
  hostConn?: Connection
  players: {[id: string]: string} = {}
  roomCode?: string

  constructor(myConnection: ConnectionManager) {
    super()
    this.myConnection = myConnection
  }
  public async sendHost(pkgType: PkgType, data: any) {
    if(this.hostConn === undefined){
      throw new Error('not connected to host')
    }
    return this.myConnection.sendPkg(this.hostConn.id, pkgType, data)
  }
  public async create(myName: string) {
    while(true){
      const roomCode = generateRoomCode()
      try{
        await this.myConnection.connectPrefix(roomCode)
        this.myConnection.conn(roomCode).close()
      } catch (e){
        await this.host(roomCode)
        await this.join(myName, roomCode)
        return roomCode
      }
    }
    // this.myConnection.connect(ConnectionManager.prefixId(roomName+'host')).then(()).catch(this.hostRoom(roomName))
  }
  public async host(roomCode: string){
    this.hostConnection = ConnectionManager.withPrefix(roomCode)
    this.hostConnection.onPkg(PkgType.JOIN, ({conn, data}) => {
      console.log('on join')
      if(conn !== undefined) {
        conn?.sendPkg(PkgType.PLAYERS, this.players)
        this.hostConnection?.broadcastPkg(PkgType.NEW_JOIN, [data, conn.id])
      }
    })
    await this.hostConnection.until(ConnEvent.PEER_OPEN)
  }

  public async join(myName: string, roomCode: string){
    console.log('join', myName, roomCode)
    this.hostConn = await this.myConnection.connectPrefix(roomCode)
    const c1 = this.myConnection.onPkg(PkgType.NEW_JOIN, ({data: [name, id]}) =>  {
      console.log('new join', [name, id])
      this.myConnection.connect(id)
      this.players[id] = name
      this.emit(RoomEvents.SET_PLAYERS, {...this.players})
    })
    // this.myConnection.onMatch(ConnEvent.CONN_CLOSE, ({conn}: ConnectionListenerPayload) => conn?.id === this.hostConn, () => {
    //
    // })
    console.log('send join')
    this.sendHost(PkgType.JOIN, myName)
    console.log('sent join')
    const {data} = await this.myConnection.untilPkg(PkgType.PLAYERS)
    console.log('join received ', data)
    this.players = data
    this.roomCode = roomCode
    return Promise.all(Object.keys(data).map((id) =>this.myConnection.connect(id)))
  }
}
