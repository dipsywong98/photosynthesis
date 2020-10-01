import { Box, Divider, Flex, Grid } from '@theme-ui/components'
import Button from './common/Button'
import { ACTION_COST_GROW, ACTION_COST_SEED, GrowthStage } from '../3d/constants'
import CollapsibleWell from './common/CollapsibleWell'
import React, { FunctionComponent, useState } from 'react'
import { GameState } from '../Game/types/GameState'
import { Room, RoomState } from '../lib/Room'
import { Axial } from '../3d/Coordinates/Axial'
import PropTypes from 'prop-types'
import { PlayerInfo } from '../Game/types/PlayerInfo'
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
import { InteractionState } from './GamePlayer'
import { GameActions } from '../Game/Game'
import { SunlightBadge } from './SunlightBadge'

interface props {
  mi: number // my player id
  roomState: RoomState
  purchase: (growStage: GrowthStage) => Promise<void>
  plantSeed: (source: Axial, target: Axial) => Promise<void>
  growTree: (source: Axial) => Promise<void>
  endTurn: () => Promise<void>
  nextRound: () => void
  interactionStateReducer: (patch: Partial<InteractionState>) => void
}

const propTypes = {
  mi: PropTypes.number.isRequired,
  roomState: PropTypes.any.isRequired,
  purchase: PropTypes.func.isRequired,
  plantSeed: PropTypes.func.isRequired,
  growTree: PropTypes.func.isRequired,
  endTurn: PropTypes.func.isRequired,
  nextRound: PropTypes.func.isRequired,
  interactionStateReducer: PropTypes.func.isRequired
}

export const Panel: FunctionComponent<props> = ({ mi, roomState, purchase, plantSeed, growTree, endTurn, nextRound, interactionStateReducer }) => {
  const gameState: GameState | undefined = roomState.game
  const [activePlayerId, setActivePlayerId] = useState(mi)
  const playerInfo: PlayerInfo | undefined = gameState?.playerInfo[activePlayerId]
  const gameOver = gameState?.gameOver
  const clickToPurchase = (growthStage: GrowthStage): void => {
    interactionStateReducer({ growthStage, action: GameActions.PURCHASE })
  }
  const clickToEndTurn = (): void => {
    interactionStateReducer({ action: GameActions.END_TURN })
  }
  const handlerAvailableTokenClick = (growthStage: GrowthStage): void => {
    if (growthStage === GrowthStage.SEED) {
      interactionStateReducer({ action: GameActions.PLANT_SEED })
    } else {
      interactionStateReducer({ action: GameActions.GROW_TREE, growthStage: growthStage - 1 })
    }
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
            <Box><Icon path={directionSvgs[(gameState.rayDirection + 5) % 6]}/></Box>
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
          <Flex sx={{ justifyContent: 'space-between' }}>
            <ButtonGroup>
              {Object.entries(roomState.nameDict ?? {}).map(([name, id]) => (
                <Button
                  key={id}
                  variant={id !== activePlayerId.toString() ? 'normal' : 'primary'}
                  onClick={() => setActivePlayerId(Number.parseInt(id))}>
                  {name}
                </Button>
              ))}
              <Button onClick={() => console.log(roomState)}>O</Button>
            </ButtonGroup>
            {gameState.turn === mi && <Button onClick={clickToEndTurn}>End Turn</Button>}
          </Flex>
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
                      onClick={(activePlayerId === mi && (gameState.preparingRound <= 0 || growthStage === GrowthStage.SHORT.toString())) ? () => handlerAvailableTokenClick(Number.parseInt(growthStage)) : undefined}
                      imgPath={getTreeImageByColorGrowthStage(playerInfo.color, Number.parseInt(growthStage))}
                      stack={new Array(amount).fill(<SunlightBadge
                        sx={{
                          top: 0,
                          right: '-4px',
                          position: 'absolute'
                        }}>
                        {Number.parseInt(growthStage) === GrowthStage.SEED ? ACTION_COST_SEED : ACTION_COST_GROW[Number.parseInt(growthStage) - 1 as GrowthStage]}
                      </SunlightBadge>)}
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
                        onClick={activePlayerId === mi ? () => clickToPurchase(Number.parseInt(growStage)) : undefined}
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
