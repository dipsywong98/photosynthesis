import React, { FunctionComponent, useEffect } from 'react'
import { Panel } from './Panel'
import { getInitialState } from '../Game/getInitialState'
import { Box } from '@theme-ui/components'
import { Color, GrowthStage } from '../3d/constants'
import { globalRoom } from '../lib/RoomContext'
import PropTypes, { InferProps } from 'prop-types'
import { AppState } from './App'
import { ConnEvent } from '../lib/ConnectionTypes'
import Axial from '../3d/Coordinates/Axial'
import { createTree } from '../Game/entities/tree'

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
roomState.game.playerInfo[0].playerBoard[GrowthStage.SEED][1] = false
roomState.game.playerInfo[0].playerBoard[GrowthStage.SHORT][0] = false
roomState.game.playerInfo[0].playerBoard[GrowthStage.SHORT][1] = false
roomState.game.playerInfo[0].playerBoard[GrowthStage.TALL][0] = false
roomState.game.playerInfo[0].playerBoard[GrowthStage.TALL][1] = false
roomState.game.preparingRound = 0
globalRoom.network.state = roomState
globalRoom.network.myConnectionManager.id = 'id1'
// const axial0 = new Axial(0, 0)
// const axial1 = new Axial(-1, 1)
// const axial2 = new Axial(-2, 2)
const axial3 = new Axial(-3, 3)
globalRoom.network.myConnectionManager.on(ConnEvent.PEER_OPEN, () => {
  globalRoom.network.myConnectionManager.id = 'id1'
  createTree(globalRoom.game.gameWorld, {
    color: Color.BLUE,
    growthStage: GrowthStage.SEED,
    axial: axial3
  })
})

const propTypes = {
  setState: PropTypes.func
}

export const TestPanel: FunctionComponent<InferProps<typeof propTypes>> = ({ setState }) => {
  const mockFn = async (...params: unknown[]): Promise<void> => {
    console.log(params)
    await Promise.resolve()
  }
  const nextRound = (): void => {
    console.log('nextRound')
  }
  useEffect(() => {
    setState?.(AppState.GAME)
  }, [setState])
  return (
    <Box sx={{ position: 'fixed', bottom: 0, width: '100vw' }}>
      <Panel
        mi={0}
        roomState={roomState}
        nextRound={nextRound}
        interactionStateReducer={mockFn}
      />
    </Box>
  )
}

TestPanel.propTypes = propTypes
