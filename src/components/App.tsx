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
import GameRenderer from './GameRenderer'
import { Box } from '@theme-ui/components'

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
    <Box>
      <NavBar setState={setState} state={state}/>
      <Box sx={{ width: '100vw', height: '100vh', overflow: 'hidden', position: 'relative' }}>
        <GameContextProvider>
          <GameRenderer/>
          <Flex sx={{ width: '100vw', bottom: 0, left: `${-(state - 2) * 100}%`, position: 'absolute', ...transition(0.3, ['left'], 'linear') }}>
            <GamePlayer setState={setState}/>
          </Flex>
          <Flex sx={{ width: '100vw', height: '100vh', left: `${-(state - 1) * 100}%`, justifyContent: 'center', alignItems: 'center', position: 'absolute', ...transition(0.3, ['left'], 'linear') }}>
            <Room setState={setState}/>
          </Flex>
          <Flex sx={{ width: '100vw', height: '100vh', left: `${-state * 100}%`, justifyContent: 'center', alignItems: 'center', position: 'absolute', ...transition(0.3, ['left'], 'linear') }}>
            <Home setState={setState}/>
          </Flex>
        </GameContextProvider>
      </Box>
    </Box>
  )
}

export default withAlertQueue(App)
