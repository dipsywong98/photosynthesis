import React, { FunctionComponent } from 'react'
import PropTypes from 'prop-types'
import { useGame } from '../Game/GameContext'
import { Box, Divider } from '@theme-ui/components'
import Button from './common/Button'
import { AppState } from './App'
import GameRenderer from './GameRenderer'
import { Card } from './common/Card'

const propTypes = {
  setState: PropTypes.func.isRequired
}

export const GamePlayer: FunctionComponent<PropTypes.InferProps<typeof propTypes>> = ({ setState }) => {
  const [game, gameState, gameOver] = useGame()
  const click = (x: number, y: number): void => {
    game?.click(x, y).catch(console.log)
  }
  return (
    <Box>
      <GameRenderer gameWorld={game.gameWorld}/>
      <Box
        sx={{
          position: 'relative',
          zIndex: 1
        }}>
        <Card>
          {
            gameOver !== undefined && (
              <Box>
                <Divider/>
                <Button variant='primary' onClick={() => { setState(AppState.ROOM) }}>Next Round</Button>
              </Box>
            )
          }
        </Card>
      </Box>
    </Box>
  )
}

GamePlayer.propTypes = propTypes
