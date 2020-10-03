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
import { useConfirm } from './common/ConfirmContext'
import { useAlert } from './common/AlertContext'

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
// roomState.game.playerInfo[0].availableArea[GrowthStage.SEED] = 0
// roomState.game.playerInfo[0].availableArea[GrowthStage.SHORT] = 0
// roomState.game.playerInfo[0].availableArea[GrowthStage.MID] = 0
roomState.game.playerInfo[0].playerBoard[GrowthStage.SHORT][0] = false
roomState.game.playerInfo[0].playerBoard[GrowthStage.SHORT][1] = false
roomState.game.playerInfo[0].playerBoard[GrowthStage.SHORT][2] = false
roomState.game.playerInfo[0].playerBoard[GrowthStage.SHORT][3] = false
roomState.game.playerInfo[0].lightPoint = 100
roomState.game.preparingRound = 0
globalRoom.network.state = roomState
globalRoom.network.myConnectionManager.id = 'id1'
const axial0 = new Axial(0, 0)
const axial1 = new Axial(-1, 1)
const axial2 = new Axial(-2, 2)
const axial3 = new Axial(-3, 3)
globalRoom.network.myConnectionManager.on(ConnEvent.PEER_OPEN, () => {
  globalRoom.network.myConnectionManager.id = 'id1'
})
window.addEventListener('load', () => {
  globalRoom.game.setTile(roomState.game, axial3, {
    color: Color.BLUE,
    growthStage: GrowthStage.TALL
  })
  globalRoom.game.setTile(roomState.game, axial2, {
    color: Color.BLUE,
    growthStage: GrowthStage.TALL
  })
  globalRoom.game.setTile(roomState.game, axial1, {
    color: Color.BLUE,
    growthStage: GrowthStage.TALL
  })
  globalRoom.game.setTile(roomState.game, axial0, {
    color: Color.BLUE,
    growthStage: GrowthStage.TALL
  })
  globalRoom.game.setTile(roomState.game, new Axial(0, 1), {
    color: Color.BLUE,
    growthStage: GrowthStage.MID
  })
  globalRoom.game.setTile(roomState.game, new Axial(0, 2), {
    color: Color.BLUE,
    growthStage: GrowthStage.SHORT
  })
  globalRoom.game.setTile(roomState.game, new Axial(0, 3), {
    color: Color.BLUE,
    growthStage: GrowthStage.SEED
  })
  // globalRoom.game.endGameCalculation(roomState.game)
  // roomState.game.revolutionLeft = 0
  // roomState.game.turn = 3
  // globalRoom.network.dispatchLocal({
  //   action: RoomActionTypes.GAME_EVENT,
  //   payload: {
  //     action: GameActions.END_TURN,
  //     payload: []
  //   }
  // }).catch(console.log)
})

const propTypes = {
  setState: PropTypes.func
}

export const TestPanel: FunctionComponent<InferProps<typeof propTypes>> = ({ setState }) => {
  const confirm = useConfirm()
  const alert = useAlert()
  const mockFn = async (...params: unknown[]): Promise<void> => {
    console.log(params)
    alert('alert')
    const result = await confirm('confirm')
    console.log(result)
    await Promise.resolve()
  }
  useEffect(() => {
    setState?.(AppState.GAME)
  }, [setState])
  return (
    <Box sx={{ position: 'fixed', bottom: 0, width: '100vw' }}>
      <Panel
        mi={0}
        roomState={roomState}
        interactionStateReducer={mockFn}
      />
    </Box>
  )
}

TestPanel.propTypes = propTypes
