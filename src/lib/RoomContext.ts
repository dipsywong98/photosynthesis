import { createContext, useContext } from 'react'
import { Room } from './Room'

export const globalRoom = new Room()
export const RoomContext = createContext(globalRoom)
export const useRoom = (): Room => useContext(RoomContext)
