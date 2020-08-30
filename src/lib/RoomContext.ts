import { createContext, useContext } from 'react'
import { Room } from './Room'

export const RoomContext = createContext(new Room())
export const useRoom = () => useContext(RoomContext)
