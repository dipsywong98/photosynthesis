import React, { FunctionComponent, useEffect } from 'react'
import PropTypes from 'prop-types'
import { Box, Flex } from '@theme-ui/components'
import { Image } from './common/Image'
import { getTreeImageByColorGrowthStage } from './TreeTokenStack'
import { ACTION_COST_GROW, ACTION_COST_SEED, GROWTH_STAGE_NAME, GrowthStage } from '../3d/constants'
import { Game, GameActions } from '../Game/Game'
import { getScoreTokenImageByLeaves } from './ScoreTokenStack'
import { Card } from './common/Card'
import { InteractionState } from './GamePlayer'
import { Axial } from '../3d/Coordinates/Axial'
import { SunlightBadge } from './SunlightBadge'
import Button from './common/Button'
import { ImageStack } from './common/ImageStack'
import { useAlert } from './common/AlertContext'

const propTypes = {
  game: PropTypes.any.isRequired,
  interactionState: PropTypes.any.isRequired,
  interactionStateReducer: PropTypes.func.isRequired
}

interface Props {
  interactionState: InteractionState
  interactionStateReducer: (patch: Partial<InteractionState> | undefined) => void
  game: Game
}

export const Popper: FunctionComponent<Props> = ({ interactionState, game, interactionStateReducer }) => {
  const isMyTile = (axial: Axial): boolean => game.started && game.state?.board[axial.toString()].color === game.mi
  const growthStageOfTile: GrowthStage | undefined = game.started ? game.state?.board[interactionState?.axial?.toString() ?? '']?.growthStage : undefined
  const domElement = game.gameWorld.renderer.domElement.parentElement
  const alert = useAlert()
  useEffect(() => {
    const listener = (event: TouchEvent | MouseEvent): void => {
      const popperCoord: [number, number] = [0, 0]
      if (event instanceof MouseEvent) {
        popperCoord[0] = event.clientX
        popperCoord[1] = event.clientY
      } else {
        popperCoord[0] = event.changedTouches[0].pageX
        popperCoord[1] = event.changedTouches[0].pageY
      }
      const axial = game.gameWorld.getActiveAxial()
      if (axial === undefined) {
        interactionStateReducer(undefined)
      } else {
        interactionStateReducer({ popperCoord: popperCoord, axial })
      }
    }
    domElement?.addEventListener('click', listener)
    return () => {
      domElement?.removeEventListener('click', listener)
    }
  }, [domElement, game.gameWorld, interactionStateReducer])
  if (interactionState.axial === undefined || game.state === undefined || interactionState.popperCoord === undefined) {
    return null
  }
  if (!game.started) {
    return null
  }
  const playerInfo = game.state.playerInfo[game.mi]
  const errorHandler = (e: Error): void => {
    alert(e.message)
  }
  const purchase = (growthStage: GrowthStage): void => {
    game.purchase(growthStage).catch(errorHandler)
  }
  const plantInitialTreeButton = (
    <Box>
      <Box>Plant initial tree</Box>
      <Image
        path={getTreeImageByColorGrowthStage(game.mi, GrowthStage.SHORT)}
        onClick={() => interactionStateReducer({ action: GameActions.GROW_TREE })}
      />
    </Box>
  )
  const iHaveSeed = playerInfo.availableArea[GrowthStage.SEED] >= 1
  const purchaseSeedCost = Game.nextPurchase(game.state, game.mi, GrowthStage.SEED).cost
  const plantSeedButton = (
    <Box m={1}>
      <Box>Seed</Box>
      <ImageStack
        imgPath={getTreeImageByColorGrowthStage(game.mi, GrowthStage.SEED)}
        stack={[<SunlightBadge
          key={1}
          myPoints={playerInfo.lightPoint}
          sx={{ position: 'absolute', top: 0, right: '-4px' }}>{ACTION_COST_SEED}</SunlightBadge>]}
        badge={playerInfo.availableArea[GrowthStage.SEED]}
        onClick={() => interactionStateReducer({ action: GameActions.PLANT_SEED })}
        enabled={[iHaveSeed && playerInfo.lightPoint >= ACTION_COST_SEED]}
      />
      {!iHaveSeed && (<Box sx={{ position: 'relative' }}>
        <Button
          variant='normal-pill-sm'
          mt={2}
          onClick={() => purchase(GrowthStage.SEED)}
          disabled={purchaseSeedCost === undefined || playerInfo.lightPoint < purchaseSeedCost}>
          {purchaseSeedCost === undefined ? 'N/A' : 'Buy'}
        </Button>
        <SunlightBadge
          myPoints={playerInfo.lightPoint}
          sx={{ position: 'absolute', right: 0, top: 0 }}>
          {purchaseSeedCost}
        </SunlightBadge>
      </Box>)}
    </Box>
  )
  const iHaveNextTree = growthStageOfTile !== undefined && playerInfo.availableArea[growthStageOfTile + 1 as GrowthStage] > 0
  const purchaseNextStageCost = growthStageOfTile !== undefined && growthStageOfTile !== GrowthStage.TALL ? Game.nextPurchase(game.state, game.mi, growthStageOfTile + 1).cost : Infinity
  const growTreeButton = growthStageOfTile !== undefined && growthStageOfTile !== GrowthStage.TALL && (
    <Box m={1}>
      {game.haveSlot(game.state, game.mi, growthStageOfTile)
        ? <Box>Grow</Box>
        : <Box
          title={`No empty slots on your purchase board. Proceed and you will say bye bye to your lovely ${GROWTH_STAGE_NAME[growthStageOfTile]}. So think carefully.`}
          sx={{ color: 'yellow.0' }}>
          Grow
        </Box>}
      <ImageStack
        imgPath={getTreeImageByColorGrowthStage(game.mi, growthStageOfTile + 1)}
        stack={[<SunlightBadge
          key={1}
          myPoints={playerInfo.lightPoint}
          sx={{ position: 'absolute', top: 0, right: '-4px' }}>{ACTION_COST_GROW[growthStageOfTile]}</SunlightBadge>]}
        badge={playerInfo.availableArea[growthStageOfTile + 1 as GrowthStage]}
        onClick={() => interactionStateReducer({ action: GameActions.GROW_TREE })}
        enabled={[iHaveNextTree && playerInfo.lightPoint >= ACTION_COST_GROW[growthStageOfTile]]}
      />
      {!iHaveNextTree &&
      <Box sx={{ position: 'relative' }}>
        <Button
          variant='normal-pill-sm'
          mt={2}
          onClick={() => purchase(growthStageOfTile + 1)}
          disabled={purchaseNextStageCost === undefined || playerInfo.lightPoint < purchaseNextStageCost}>
          {purchaseNextStageCost === undefined ? 'N/A' : 'Buy'}
        </Button>
        <SunlightBadge
          myPoints={playerInfo.lightPoint}
          sx={{ position: 'absolute', right: 0, top: 0 }}>
          {purchaseNextStageCost}
        </SunlightBadge>
      </Box>}
    </Box>
  )
  const nextToken = game.nextToken(game.state, interactionState.axial)
  const harvestButton = growthStageOfTile !== undefined && growthStageOfTile === GrowthStage.TALL && (
    <Box m={1}>
      <Box>Harvest</Box>
      <ImageStack
        stack={[<Box key={1} sx={{ position: 'relative' }}>
          <SunlightBadge
            myPoints={playerInfo.lightPoint}
            sx={{ position: 'absolute', right: '-4px' }}>{ACTION_COST_GROW[growthStageOfTile]}</SunlightBadge>
          <Box>
            {nextToken.score}
          </Box>
        </Box>]}
        imgPath={getScoreTokenImageByLeaves(nextToken.leaves)}
        onClick={() => interactionStateReducer({ action: GameActions.GROW_TREE })}
        enabled={[playerInfo.lightPoint >= ACTION_COST_GROW[GrowthStage.TALL]]}
      />
    </Box>
  )
  return (
    <Card
      sx={{
        p: 2,
        position: 'fixed',
        left: `${interactionState.popperCoord?.[0].toString() ?? '0'}px`,
        top: `${interactionState.popperCoord?.[1].toString() ?? '0'}px`,
        backgroundColor: 'bgPales.0',
        zIndex: 1
      }}>
      {interactionState.axial.toString()}
      {
        (game.state.preparingRound > 0
          ? (growthStageOfTile === undefined && plantInitialTreeButton)
          : (
            <Flex sx={{ justifyItems: 'space-around' }}>
              {(isMyTile(interactionState.axial) || growthStageOfTile === undefined) && plantSeedButton}
              {growthStageOfTile !== undefined && isMyTile(interactionState.axial) && (
                growthStageOfTile === GrowthStage.TALL ? harvestButton : growTreeButton
              )}
            </Flex>))
      }
    </Card>
  )
}

Popper.propTypes = propTypes
