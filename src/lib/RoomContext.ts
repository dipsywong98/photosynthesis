import {createContext, useContext} from 'react'
import {ConnectionManager} from './ConnectionManager'
import {Room} from './Room'

export const RoomContext = createContext(new Room(new ConnectionManager()))
export const useRoom = () => useContext(RoomContext)
