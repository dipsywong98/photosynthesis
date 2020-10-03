import { Box, Flex, Grid } from '@theme-ui/components'
import Button from './common/Button'
import { ACTION_COST_GROW, ACTION_COST_SEED, GrowthStage } from '../3d/constants'
import CollapsibleWell from './common/CollapsibleWell'
import React, { FunctionComponent, useEffect, useState } from 'react'
import { GameState } from '../Game/types/GameState'
import { Room, RoomState } from '../lib/Room'
import PropTypes from 'prop-types'
import { PlayerInfo } from '../Game/types/PlayerInfo'
import { ScoreTokenStack } from './ScoreTokenStack'
import ButtonGroup from './common/ButtonGroup'
import { SunlightTag } from './SunlightTag'
import { getTreeImageByColorGrowthStage, TreeTokenStack } from './TreeTokenStack'
import { ImageStack } from './common/ImageStack'
import { InteractionState } from './GamePlayer'
import { Game, GameActions } from '../Game/Game'
import { SunlightBadge } from './SunlightBadge'

interface props {
  mi: number | undefined // my player id
  roomState: RoomState
  interactionStateReducer: (patch: Partial<InteractionState>) => void
}

const propTypes = {
  mi: PropTypes.number,
  roomState: PropTypes.any.isRequired,
  interactionStateReducer: PropTypes.func.isRequired
}

export const Panel: FunctionComponent<props> = ({ mi, roomState, interactionStateReducer }) => {
  const gameState: GameState | undefined = roomState.game
  const [activePlayerId, setActivePlayerId] = useState(mi)
  useEffect(() => {
    if (mi !== undefined) {
      setActivePlayerId(mi)
    }
  }, [mi])
  const playerInfo: PlayerInfo | undefined = gameState?.playerInfo[activePlayerId ?? -1]
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
  return (
    <CollapsibleWell
      header={gameState !== undefined ? `Current turn: ${id2Name(gameState.turn)}` : 'Board'}
      sx={{ m: 0, bg: 'bgPales.0', maxHeight: '100vh' }}
      defaultOpen={true}>
      {gameState !== undefined && <Flex sx={{ flexWrap: 'wrap', justifyContent: 'space-around' }}>
        <Box>
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
                  variant={id !== activePlayerId?.toString() ? 'normal' : 'primary'}
                  onClick={() => setActivePlayerId(Number.parseInt(id))}>
                  {name}
                </Button>
              ))}
              <Button onClick={() => console.log(roomState)}>O</Button>
            </ButtonGroup>
            {gameState.turn === mi && <Button onClick={clickToEndTurn} disabled={gameState.preparingRound > 0}>End Turn</Button>}
          </Flex>
          {playerInfo !== undefined && <Box>
            <Grid columns={2}>
              <SunlightTag>{playerInfo.lightPoint ?? ''}</SunlightTag>
              <Box>Score: {playerInfo.score}</Box>
            </Grid>
            <Grid columns={[1, null, 2]}>
              <Box>
                <Box>Available:</Box>
                <Flex>{Object.entries(playerInfo.availableArea).map(([growthStage, amount]) => {
                  const cost = Number.parseInt(growthStage) === GrowthStage.SEED ? ACTION_COST_SEED : ACTION_COST_GROW[Number.parseInt(growthStage) - 1 as GrowthStage]
                  return (
                    <Box key={growthStage} sx={{ position: 'relative' }}>
                      <ImageStack
                        key={growthStage}
                        onClick={(activePlayerId === mi && playerInfo.lightPoint >= cost && (gameState.preparingRound <= 0 || growthStage === GrowthStage.SHORT.toString())) ? () => handlerAvailableTokenClick(Number.parseInt(growthStage)) : undefined}
                        imgPath={getTreeImageByColorGrowthStage(playerInfo.color, Number.parseInt(growthStage))}
                        enabled={amount === 0 ? [false] : undefined}
                        stack={new Array(Math.max(1, amount)).fill(<SunlightBadge
                          myPoints={playerInfo.lightPoint}
                          sx={{
                            top: 0,
                            right: '-4px',
                            position: 'absolute'
                          }}>
                          {cost}
                        </SunlightBadge>)}
                        badge={amount}
                      />
                    </Box>
                  )
                })}
                </Flex>
              </Box>
              <Box>
                <Box>Purchase:</Box>
                <Flex>
                  {
                    Object.entries(playerInfo.playerBoard).map(([growStage, canBuy]) => (
                      <TreeTokenStack
                        key={growStage}
                        onClick={activePlayerId === mi && activePlayerId !== undefined && playerInfo.lightPoint >= Game.nextPurchase(gameState, activePlayerId, Number.parseInt(growStage)).cost ? () => clickToPurchase(Number.parseInt(growStage)) : undefined}
                        growthStage={Number.parseInt(growStage)}
                        color={playerInfo.color}
                        canBuy={canBuy}
                        myPoints={playerInfo.lightPoint}
                      />
                    ))
                  }
                </Flex>
              </Box>
            </Grid>
          </Box>}
        </Box>
      </Flex>}
    </CollapsibleWell>
  )
}

Panel.propTypes = propTypes
