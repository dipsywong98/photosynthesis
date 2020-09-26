import { Box, Divider, Flex, Grid, Heading } from '@theme-ui/components'
import Button from './common/Button'
import { GrowthStage } from '../3d/constants'
import CollapsibleWell from './common/CollapsibleWell'
import React, { FunctionComponent, useMemo, useState } from 'react'
import { GameState } from '../Game/types/GameState'
import { Room, RoomState } from '../lib/Room'
import { Axial } from '../3d/Coordinates/Axial'
import PropTypes from 'prop-types'
import { PlayerInfo } from '../Game/types/PlayerInfo'
import { useAlert } from './common/AlertContext'
import {
  mdiArrowBottomLeft,
  mdiArrowBottomRight,
  mdiArrowLeft,
  mdiArrowRight,
  mdiArrowTopLeft,
  mdiArrowTopRight
} from '@mdi/js'
import Icon from './common/Icon'
import { TokenStack } from './TokenStack'

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
  const id2Name = (id: number): string => Room.getName(roomState, id)
  const directionSvgs = [
    mdiArrowRight,
    mdiArrowTopRight,
    mdiArrowTopLeft,
    mdiArrowLeft,
    mdiArrowBottomLeft,
    mdiArrowBottomRight
  ]
  return (
    <CollapsibleWell
      header='Board'
      sx={{ m: 0, backgroundColor: 'rgba(255, 255, 255, 0.6)' }}
      color='background.0'
      defaultOpen={true}>
      {gameState !== undefined && <Flex>
        <Box>
          <Heading variant='subheading'>
            {`Current turn: ${id2Name(gameState.turn)}`}
          </Heading>
          <Grid columns={2}>
            <Box>Rounds Left</Box>
            <Box>
              {
                gameState.preparingRound > 0
                  ? `${gameState.preparingRound} Preparations`
                  : `${gameState.revolutionLeft} Revolutions`}
            </Box>
            <Box>Ray Direction</Box>
            <Box><Icon path={directionSvgs[gameState.rayDirection]}/></Box>
            <Box>Next Ray Direction</Box>
            <Box><Icon path={directionSvgs[(gameState.rayDirection + 1) % 6]}/></Box>
            <Box>Score Tokens</Box>
            <Flex>
              {
                Object.entries(gameState.scoreTokens).map(([leaves, stack]) => (
                  <TokenStack key={leaves} leaves={Number.parseInt(leaves)} stack={stack}/>
                ))
              }
            </Flex>
          </Grid>
        </Box>
      </Flex>}
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
