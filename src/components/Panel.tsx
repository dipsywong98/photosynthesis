import { Box, Divider, Flex } from '@theme-ui/components'
import Button from './common/Button'
import Select from './common/Select'
import { Color, GrowthStage } from '../3d/constants'
import Input from './common/Input'
import CollapsibleWell from './common/CollapsibleWell'
import React, { FunctionComponent, useMemo, useState } from 'react'
import { GameState } from '../Game/types/GameState'
import { Room, RoomState } from '../lib/Room'
import { Axial } from '../3d/Coordinates/Axial'
import PropTypes from 'prop-types'
import { PlayerInfo } from '../Game/types/PlayerInfo'
import { useAlert } from './common/AlertContext'

interface props {
  mi: number // my player id
  roomState: RoomState
  purchase: (growStage: GrowthStage) => Promise<void>
  plantSeed: (source: Axial, target: Axial) => Promise<void>
  growTree: (source: Axial) => Promise<void>
  endTurn: () => Promise<void>
  nextRound: () => void
}

const propTypes = {
  mi: PropTypes.number.isRequired,
  roomState: PropTypes.any.isRequired,
  purchase: PropTypes.func.isRequired,
  plantSeed: PropTypes.func.isRequired,
  growTree: PropTypes.func.isRequired,
  endTurn: PropTypes.func.isRequired,
  nextRound: PropTypes.func.isRequired
}

export const Panel: FunctionComponent<props> = ({ mi, roomState, purchase, plantSeed, growTree, endTurn, nextRound }) => {
  const [axialString, setAxialString] = useState('')
  const [axialString2, setAxialString2] = useState('')
  const [stage, setStage] = useState<GrowthStage>(GrowthStage.SEED)
  const axial = useMemo(() => Axial.fromString(axialString), [axialString])
  const axial2 = useMemo(() => Axial.fromString(axialString2), [axialString2])
  const gameState: GameState | undefined = roomState.game
  const playerInfo: PlayerInfo | undefined = gameState?.playerInfo[mi]
  const gameOver = gameState?.gameOver
  const _alert = useAlert()
  const alert = (e: string): void => {
    console.error(e)
    _alert(e)
  }
  const clickToSeed = (): void => {
    plantSeed(axial, axial2).catch(alert)
  }
  const clickToGrow = (): void => {
    growTree(axial).catch(alert)
  }
  const clickToPurchase = (): void => {
    purchase(stage).catch(alert)
  }
  const clickToEndTurn = (): void => {
    endTurn().catch(alert)
  }
  return (
    <CollapsibleWell header='Board' sx={{ m: 0, backgroundColor: 'rgba(255, 255, 255, 0.6)' }} color='background.0'>
      <Flex>
        <Box>
          <Button onClick={() => console.log(gameState)}>Log Game State</Button>
          <Button onClick={() => console.log(roomState)}>Log Room State</Button>
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
          <Button onClick={clickToSeed}>Seed</Button>
          <Button onClick={clickToGrow}>Grow</Button>
          <Button onClick={clickToPurchase}>Purchase</Button>
          <Button onClick={clickToEndTurn}>End Turn</Button>
        </Box>
        {gameState !== undefined && (
          <Box>
            <Box>Public</Box>
            <Box>{Room.getName(roomState, gameState.turn)} turn</Box>
            <Box>Ray Direction {gameState.rayDirection}</Box>
            <Box>Rotation left {gameState.revolutionLeft}</Box>
            <Box>Tokens: {gameState.revolutionLeft}</Box>
            <Box>Me: {mi} {Room.getName(roomState, mi)}</Box>
            <Box>Color: {playerInfo?.color !== undefined ? Color[playerInfo?.color] : ''}</Box>
            <Box>LightPoint: {playerInfo?.lightPoint}</Box>
            <Box>Score: {playerInfo?.score}</Box>
            <Box>Available: {JSON.stringify(playerInfo?.availableArea)}</Box>
            <Box>Board: {JSON.stringify(playerInfo?.playerBoard)}</Box>
          </Box>
        )}
      </Flex>
      {
        gameOver !== undefined && (
          <Box>
            <Divider/>
            <Button variant='primary' onClick={() => nextRound}>Next Round</Button>
            {gameOver}
          </Box>
        )
      }
    </CollapsibleWell>
  )
}

Panel.propTypes = propTypes
