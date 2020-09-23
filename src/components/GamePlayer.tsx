import React, { FunctionComponent, useMemo, useState } from 'react'
import PropTypes from 'prop-types'
import { useGame } from '../Game/GameContext'
import { Box, Divider, Flex } from '@theme-ui/components'
import Button from './common/Button'
import { AppState } from './App'
import GameRenderer from './GameRenderer'
import { Card } from './common/Card'
import Input from './common/Input'
import Axial from '../3d/Coordinates/Axial'
import { Color, GrowthStage } from '../3d/constants'
import Select from './common/Select'
import { useAlert } from './common/AlertContext'
import { useRoom } from '../lib/RoomContext'

const propTypes = {
  setState: PropTypes.func.isRequired
}

export const GamePlayer: FunctionComponent<PropTypes.InferProps<typeof propTypes>> = ({ setState }) => {
  const [game, _state, gameOver] = useGame()
  const gameState = game.state
  const room = useRoom()
  const [axialString, setAxialString] = useState('')
  const [axialString2, setAxialString2] = useState('')
  const [stage, setStage] = useState<GrowthStage>(GrowthStage.SEED)
  const axial = useMemo(() => Axial.fromString(axialString), [axialString])
  const axial2 = useMemo(() => Axial.fromString(axialString2), [axialString2])
  const _alert = useAlert()
  const alert = (e: string): void => {
    console.error(e)
    _alert(e)
  }
  const seed = (): void => {
    game?.plantSeed(axial, axial2).catch(alert)
  }
  const grow = (): void => {
    game?.growTree(axial).catch(alert)
  }
  const purchase = (): void => {
    game?.purchase(stage).catch(alert)
  }
  const endTurn = (): void => {
    game?.endTurn().catch(alert)
  }
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
        <Card>
          <Flex>
            <Box>
              <Button onClick={() => console.log(game.state)}>Log Game State</Button>
              <Button onClick={() => console.log(room.state)}>Log Room State</Button>
              <Select
                label='GrowthStage'
                value={stage}
                choices={[GrowthStage.SEED, GrowthStage.SHORT, GrowthStage.MID, GrowthStage.TALL].map(v => [v, GrowthStage[v]])}
                formatKey='1'
                valueKey='0'
                onSelect={setStage}
              />
              <Input
                label='Axial'
                onChange={({ target: { value } }: { target: { value: string } }) => setAxialString(value)}
              />
              <Input
                label='Axial2'
                onChange={({ target: { value } }: { target: { value: string } }) => setAxialString2(value)}
              />
              <Button onClick={seed}>Seed</Button>
              <Button onClick={grow}>Grow</Button>
              <Button onClick={purchase}>Purchase</Button>
              <Button onClick={endTurn}>End Turn</Button>
            </Box>
            {gameState !== undefined && (
              <Box>
                <Box>Public</Box>
                <Box>{room.whoami(gameState.turn.toString())} turn</Box>
                <Box>Ray Direction {gameState.rayDirection}</Box>
                <Box>Rotation left {gameState.revolutionLeft}</Box>
                <Box>Tokens: {gameState.revolutionLeft}</Box>
                <Box>Me: {room.myId} {room.whoami(game.me)}</Box>
                <Box>Color: {Color[gameState.playerInfo[game.mi].color]}</Box>
                <Box>LightPoint: {gameState.playerInfo[game.mi].lightPoint}</Box>
                <Box>Score: {gameState.playerInfo[game.mi].score}</Box>
                <Box>Available: {JSON.stringify(gameState.playerInfo[game.mi].availableArea)}</Box>
                <Box>Board: {JSON.stringify(gameState.playerInfo[game.mi].playerBoard)}</Box>
              </Box>
            )}
          </Flex>
          {
            gameOver !== undefined && (
              <Box>
                <Divider/>
                <Button variant='primary' onClick={() => { setState(AppState.ROOM) }}>Next Round</Button>
              </Box>
            )
          }
        </Card>
      </Flex>
    </Box>
  )
}

GamePlayer.propTypes = propTypes
