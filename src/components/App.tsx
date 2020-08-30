import React, { useState } from 'react'
import { useRoom } from '../lib/RoomContext'
import { Flex } from 'theme-ui'
import NavBar from './NavBar'
import { transition } from '../theme/transitions'
import { Home } from './Home'
import { Room } from './Room'
import { Game } from '../Game/Game'
import { GameContextProvider } from '../Game/GameContext'
import { GamePlayer } from './GamePlayer'
import { withAlertQueue } from './common/AlertContext'

export enum AppState {
  HOME,
  ROOM,
  GAME
}

function App () {
  const [state, _setState] = useState(AppState.HOME)
  const [game, setGame] = useState<null|Game>(null)
  const room = useRoom()
  const setState = (newState: AppState, param: unknown) => {
    if (newState !== state) {
      if (newState === AppState.HOME) {
        window.setTimeout(() => {
          setGame(null)
        }, 300)
        room.leaveRoom()
        window.history.pushState({
          pageTitle: 'Whatever Game'
        }, '', './')
      } else if (newState === AppState.ROOM) {
        window.setTimeout(() => {
          setGame(null)
        }, 300)
        window.history.pushState({
          pageTitle: room.roomCode + ' - Whatever Game'
        }, '', './' + room.roomCode)
      } else if (newState === AppState.GAME) {
        setGame(param as Game)
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
          <GameContextProvider value={game}>
            <GamePlayer setState={setState}/>
          </GameContextProvider>
        </Flex>
      </Flex>
    </Flex>
  )
}

export default withAlertQueue(App)
