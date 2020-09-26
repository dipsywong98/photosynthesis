import React, { FunctionComponent } from 'react'
import { Panel } from './Panel'
import { getInitialState } from '../Game/getInitialState'
import { Box } from '@theme-ui/components'

const roomState = {
  maxPlayers: 4,
  minPlayers: 2,
  players: {
    id1: 'Player 1',
    id2: 'Player 2',
    id3: 'Player 3',
    id4: 'Player 4'
  },
  idDict: {
    id1: '0',
    id2: '1',
    id3: '2',
    id4: '3',
    0: 'id1',
    1: 'id2',
    2: 'id3',
    3: 'id4'
  },
  nameDict: {
    'Player 1': '0',
    'Player 2': '1',
    'Player 3': '2',
    'Player 4': '3'
  },
  game: getInitialState(4)
}
roomState.game.scoreTokens[4] = []
export const TestPanel: FunctionComponent = () => {
  const mockFn = async (...params: unknown[]): Promise<void> => {
    console.log(params)
    await Promise.resolve()
  }
  const nextRound = (): void => {
    console.log('nextRound')
  }
  return (
    <Box sx={{ position: 'fixed', bottom: 0, width: '100vw' }}>
      <Panel
        mi={0}
        roomState={roomState}
        purchase={mockFn}
        plantSeed={mockFn}
        growTree={mockFn}
        endTurn={mockFn}
        nextRound={nextRound}
      />
    </Box>
  )
}
