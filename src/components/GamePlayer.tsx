import React, { FunctionComponent } from 'react'
import PropTypes from 'prop-types'
import { useGame } from '../Game/GameContext'
import { Box, Flex } from '@theme-ui/components'
import { AppState } from './App'
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
      <Flex
        sx={{
          width: '100vw',
          flexDirection: 'column',
          justifyContent: 'flex-end',
          position: 'absolute',
          left: 0,
          bottom: 0
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
