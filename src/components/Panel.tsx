import { Box, Divider, Flex, Grid } from '@theme-ui/components'
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
import { ScoreTokenStack } from './ScoreTokenStack'
import ButtonGroup from './common/ButtonGroup'
import { SunlightTag } from './SunlightTag'
import { getTreeImageByColorGrowthStage, TreeTokenStack } from './TreeTokenStack'
import { ImageStack } from './common/ImageStack'

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
  const axial = useMemo(() => Axial.fromString(axialString), [axialString])
  const axial2 = useMemo(() => Axial.fromString(axialString2), [axialString2])
  const gameState: GameState | undefined = roomState.game
  const [activePlayerId, setActivePlayerId] = useState(mi)
  const playerInfo: PlayerInfo | undefined = gameState?.playerInfo[activePlayerId]
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
  const clickToPurchase = (stage: GrowthStage): void => {
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
      header={gameState !== undefined ? `Current turn: ${id2Name(gameState.turn)}` : 'Board'}
      sx={{ m: 0, bg: 'bgPales.0', maxHeight: '100vh' }}
      defaultOpen={true}>
      {gameState !== undefined && <Flex sx={{ flexWrap: 'wrap', justifyContent: 'space-around' }}>
        <Box>
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
          </Grid>
          <Box>Score Tokens</Box>
          <Flex>
            {
              Object.entries(gameState.scoreTokens).map(([leaves, stack]) => (
                <ScoreTokenStack key={leaves} leaves={Number.parseInt(leaves)} stack={stack}/>
              ))
            }
          </Flex>
        </Box>
        <Box>
          <ButtonGroup>
            {Object.entries(roomState.nameDict ?? {}).map(([name, id]) => (
              <Button
                key={id}
                variant={id !== activePlayerId.toString() ? 'normal' : 'primary'}
                onClick={() => setActivePlayerId(Number.parseInt(id))}>
                {name}
              </Button>
            ))}
          </ButtonGroup>
          {playerInfo !== undefined && <Box>
            <Grid columns={2}>
              <SunlightTag>{playerInfo.lightPoint ?? ''}</SunlightTag>
              <Box>Score: {playerInfo.score}</Box>
            </Grid>
            <Grid columns={[1, null, 2]}>
              <Box>
                <Box>Available:</Box>
                <Flex>{Object.entries(playerInfo.availableArea).map(([growthStage, amount]) => (
                  <Box key={growthStage} sx={{ position: 'relative' }}>
                    <ImageStack
                      key={growthStage}
                      imgPath={getTreeImageByColorGrowthStage(playerInfo.color, Number.parseInt(growthStage))}
                      stack={new Array(amount).fill(undefined)}
                      badge={amount}
                    />
                  </Box>
                ))}
                </Flex>
              </Box>
              <Box>
                <Box>Purchase:</Box>
                <Flex>
                  {
                    Object.entries(playerInfo.playerBoard).map(([growStage, canBuy]) => (
                      <TreeTokenStack
                        key={growStage}
                        onClick={() => clickToPurchase(Number.parseInt(growStage))}
                        growthStage={Number.parseInt(growStage)}
                        color={playerInfo.color}
                        canBuy={canBuy}
                      />
                    ))
                  }
                </Flex>
              </Box>
            </Grid>
          </Box>}
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
