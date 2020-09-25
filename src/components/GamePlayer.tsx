import React, { FunctionComponent } from 'react'
import PropTypes from 'prop-types'
import { useGame } from '../Game/GameContext'
import { Box, Flex } from '@theme-ui/components'
import { AppState } from './App'
import GameRenderer from './GameRenderer'
import { useRoom } from '../lib/RoomContext'
import { Panel } from './Panel'

const propTypes = {
  setState: PropTypes.func.isRequired
}

export const GamePlayer: FunctionComponent<PropTypes.InferProps<typeof propTypes>> = ({ setState }) => {
  const [game] = useGame()
  const room = useRoom()
  return (
    <Box
      sx={{
        width: '100%',
        height: '100%'
      }}>
      <GameRenderer gameWorld={game.gameWorld}/>
      <Flex
        sx={{
          width: '100%',
          height: '100%',
          flexDirection: 'column',
          justifyContent: 'flex-end',
          position: 'relative',
          zIndex: 1
        }}>
        {room.started &&
        <Panel
          mi={game.mi}
          roomState={room.state}
          purchase={game.purchase.bind(game)}
          plantSeed={game.plantSeed.bind(game)}
          growTree={game.growTree.bind(game)}
          endTurn={game.endTurn.bind(game)}
          nextRound={() => {
            setState(AppState.ROOM)
          }}
        />}
      </Flex>
    </Box>
  )
}

GamePlayer.propTypes = propTypes
