import React, { FunctionComponent, useEffect, useState } from 'react'
import PropTypes from 'prop-types'
import { useGame } from '../Game/GameContext'
import { GameEvent } from '../Game/Game'
import { Box, Divider, Flex } from '@theme-ui/components'
import { useAlert } from './common/AlertContext'
import Button from './common/Button'
import { AppState } from './App'

const propTypes = {
  setState: PropTypes.func.isRequired
}

export const GamePlayer: FunctionComponent<PropTypes.InferProps<typeof propTypes>> = ({ setState }) => {
  const [game] = useGame()
  const gameState = game?.state
  const [gameOver, setGameOver] = useState(false)
  const alert = useAlert()
  useEffect(() => {
    if (game) {
      setGameOver(false)
      game.on(GameEvent.GAME_OVER, (data: string) => {
        setGameOver(true)
        alert?.({
          title: 'Game Over',
          message: data
        })
      })
    }
  }, [game])
  if (game === null || gameState === null || gameState === undefined) return <Box/>
  console.log(gameState.board)
  return (
    <Box>
      {gameState.board.map((a: string[], x: number) => (
        <Flex>
          {
            a.map((b: string, y) => (
              <Box
                sx={{ width: '40px', height: '40px', border: '1px solid black' }}
                onClick={() => game?.send(GameEvent.CLICK, [x, y])}>
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
            <Button variant='primary' onClick={() => setState(AppState.ROOM)}>Next Round</Button>
          </Box>
        )
      }
    </Box>
  )
}