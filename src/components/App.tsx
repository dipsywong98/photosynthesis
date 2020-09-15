import React, { FunctionComponent, useState } from 'react'
import { useRoom } from '../lib/RoomContext'
import { Flex } from 'theme-ui'
import NavBar from './NavBar'
import { transition } from '../theme/transitions'
import { Home } from './Home'
import { Room } from './Room'
import { GameContextProvider } from '../Game/GameContext'
import { GamePlayer } from './GamePlayer'
import { withAlertQueue } from './common/AlertContext'

export enum AppState {
  HOME,
  ROOM,
  GAME
}

const App: FunctionComponent = () => {
  const [state, _setState] = useState(AppState.HOME)
  const room = useRoom()
  const setState = (newState: AppState): void => {
    if (newState !== state) {
      if (newState === AppState.HOME) {
        room.leaveRoom()
        window.history.pushState({
          pageTitle: 'Whatever Game'
        }, '', process.env.PUBLIC_URL)
      } else if (newState === AppState.ROOM) {
        window.history.pushState({
          pageTitle: (room.roomCode ?? '') + ' - Whatever Game'
        }, '', `${process.env.PUBLIC_URL}/${room.roomCode ?? ''}`)
      }
      _setState(newState)
    }
  }
  return (
    <Flex
      sx={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        flexDirection: 'column'
      }}>
      <NavBar setState={setState} state={state}/>
      <Flex sx={{ flex: 1, ml: `-${state * 100}%`, ...transition(0.3, ['margin-left'], 'linear') }}>
        <Flex sx={{ minWidth: '100vw', justifyContent: 'center', alignItems: 'center' }}>
          <Home setState={setState}/>
        </Flex>
        <Flex sx={{ minWidth: '100vw', justifyContent: 'center', alignItems: 'center' }}>
          <Room setState={setState}/>
        </Flex>
        <Flex sx={{ minWidth: '100vw', justifyContent: 'center', alignItems: 'center' }}>
          <GameContextProvider>
            <GamePlayer setState={setState}/>
          </GameContextProvider>
        </Flex>
      </Flex>
    </Flex>
  )
}

export default withAlertQueue(App)
