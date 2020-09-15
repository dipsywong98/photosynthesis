import React, { FunctionComponent } from 'react'
import PropTypes from 'prop-types'
import { useGame } from '../Game/GameContext'
import { Box, Divider, Flex } from '@theme-ui/components'
import Button from './common/Button'
import { AppState } from './App'
import GameRenderer from './GameRenderer'
import { useRoom } from '../lib/RoomContext'

const propTypes = {
  setState: PropTypes.func.isRequired
}

export const GamePlayer: FunctionComponent<PropTypes.InferProps<typeof propTypes>> = ({ setState }) => {
  const [game, gameState] = useGame()
  if (game === null || gameState === null || gameState === undefined) return <Box/>
  const gameOver = gameState?.gameOver !== undefined
  console.log(gameOver, gameState.board)
  return (
    <Box>
      {game !== undefined
        ? (
          <GameRenderer gameWorld={game.gameWorld}/>
        )
        : null
      }
      <Box
        sx={{
          position: 'relative',
          zIndex: 1
        }}>
        {gameState.board.map((a: Array<string | null>, x: number) => (
          <Flex key={x}>
            {
              a.map((b: (string | null), y) => (
                <Box
                  key={y}
                  sx={{ width: '40px', height: '40px', border: '1px solid black' }}
                  onClick={() => game?.click(x, y)}>
                  {b}
                </Box>
              ))
            }
          </Flex>
        ))}
        {
          gameOver && (
            <Box>
              <Divider/>
              <Button variant='primary' onClick={() => { setState(AppState.ROOM) }}>Next Round</Button>
            </Box>
          )
        }
      </Box>
    </Box>
  )
}

GamePlayer.propTypes = propTypes
