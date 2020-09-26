import React, { FunctionComponent, useState } from 'react'
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
import { TestPanel } from './TestPanel'

export enum AppState {
  HOME,
  ROOM,
  GAME
}

const App: FunctionComponent = () => {
  const [state, setState] = useState(AppState.HOME)
  return (
    <Box>
      <NavBar setState={setState} state={state}/>
      <Box sx={{ width: '100vw', height: '100vh', overflow: 'hidden', position: 'relative' }}>
        <GameContextProvider>
          <GameRenderer/>
          <Flex
            sx={{
              width: '100vw',
              bottom: 0,
              left: `${-(state - 2) * 100}%`,
              position: 'absolute',
              ...transition(0.3, ['left'], 'linear')
            }}>
            <GamePlayer setState={setState}/>
          </Flex>
          <Flex
            sx={{
              width: '100vw',
              height: '100vh',
              left: `${-(state - 1) * 100}%`,
              justifyContent: 'center',
              alignItems: 'center',
              position: 'absolute',
              ...transition(0.3, ['left'], 'linear')
            }}>
            <Room setState={setState}/>
          </Flex>
          <Flex
            sx={{
              width: '100vw',
              height: '100vh',
              left: `${-state * 100}%`,
              justifyContent: 'center',
              alignItems: 'center',
              position: 'absolute',
              ...transition(0.3, ['left'], 'linear')
            }}>
            <Home setState={setState}/>
            <TestPanel/>
          </Flex>
        </GameContextProvider>
      </Box>
    </Box>
  )
}

export default withAlertQueue(App)
