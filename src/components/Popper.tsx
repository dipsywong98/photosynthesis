import React, { FunctionComponent, useEffect } from 'react'
import PropTypes from 'prop-types'
import { Box, Flex } from '@theme-ui/components'
import { Image } from './common/Image'
import { getTreeImageByColorGrowthStage } from './TreeTokenStack'
import { ACTION_COST_GROW, ACTION_COST_SEED, GrowthStage } from '../3d/constants'
import { Game, GameActions } from '../Game/Game'
import { getScoreTokenImageByLeaves } from './ScoreTokenStack'
import { Card } from './common/Card'
import { InteractionState } from './GamePlayer'
import { Axial } from '../3d/Coordinates/Axial'
import { SunlightBadge } from './SunlightBadge'

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
  const growthStateOfTile: GrowthStage | undefined = game.started ? game.state?.board[interactionState?.axial?.toString() ?? '']?.growthStage : undefined
  const domElement = game.gameWorld.renderer.domElement.parentElement
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
  const plantInitialTreeButton = (
    <Box>
      <Box>Plant initial tree</Box>
      <Image
        path={getTreeImageByColorGrowthStage(game.mi, GrowthStage.SHORT)}
        onClick={() => interactionStateReducer({ action: GameActions.GROW_TREE })}
      />
    </Box>
  )
  const plantSeedButton = (
    <Box m={1}>
      <Box>Seed</Box>
      <Image
        path={getTreeImageByColorGrowthStage(game.mi, GrowthStage.SEED)}
        onClick={() => interactionStateReducer({ action: GameActions.PLANT_SEED })}>
        <SunlightBadge sx={{ float: 'right' }}>{ACTION_COST_SEED}</SunlightBadge>
      </Image>
    </Box>
  )
  const growTreeButton = growthStateOfTile !== undefined && growthStateOfTile !== GrowthStage.TALL && (
    <Box m={1}>
      <Box>Grow</Box>
      <Image
        path={getTreeImageByColorGrowthStage(game.mi, growthStateOfTile + 1)}
        onClick={() => interactionStateReducer({ action: GameActions.GROW_TREE })}>
        <SunlightBadge sx={{ float: 'right' }}>{ACTION_COST_GROW[growthStateOfTile]}</SunlightBadge>
      </Image>
    </Box>
  )
  const nextToken = game.nextToken(game.state, interactionState.axial)
  const harvestButton = growthStateOfTile !== undefined && growthStateOfTile === GrowthStage.TALL && (
    <Box m={1}>
      <Box>Harvest</Box>
      <Image
        path={getScoreTokenImageByLeaves(nextToken.leaves)}
        onClick={() => interactionStateReducer({ action: GameActions.GROW_TREE })}>
        <Box sx={{ position: 'relative' }}>
          <SunlightBadge sx={{ position: 'absolute', right: '-4px' }}>{ACTION_COST_GROW[growthStateOfTile]}</SunlightBadge>
          <Box>
            {nextToken.score}
          </Box>
        </Box>
      </Image>
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
        zIndex: 1000
      }}>
      {interactionState.axial.toString()}
      {
        (game.state.preparingRound > 0
          ? (plantInitialTreeButton)
          : (
            <Flex sx={{ justifyItems: 'space-around' }}>
              {(isMyTile(interactionState.axial) || growthStateOfTile === undefined) && plantSeedButton}
              {growthStateOfTile !== undefined && isMyTile(interactionState.axial) && (
                growthStateOfTile === GrowthStage.TALL ? harvestButton : growTreeButton
              )}
            </Flex>))
      }
    </Card>
  )
}

Popper.propTypes = propTypes
