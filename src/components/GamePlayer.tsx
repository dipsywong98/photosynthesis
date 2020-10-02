import React, { FunctionComponent, useCallback, useEffect, useMemo, useReducer } from 'react'
import PropTypes from 'prop-types'
import { useGame } from '../Game/GameContext'
import { Box, Flex } from '@theme-ui/components'
import { AppState } from './App'
import { useRoom } from '../lib/RoomContext'
import { Panel } from './Panel'
import { Axial } from '../3d/Coordinates/Axial'
import { ACTION_COST_GROW, ACTION_COST_SEED, GROWTH_STAGE_NAME, GrowthStage } from '../3d/constants'
import { GameActions } from '../Game/Game'
import { Card } from './common/Card'
import { Image } from './common/Image'
import { getTreeImageByColorGrowthStage } from './TreeTokenStack'
import { SunlightTag } from './SunlightTag'
import { useAlert } from './common/AlertContext'

const propTypes = {
  setState: PropTypes.func.isRequired
}

export interface InteractionState {
  source?: Axial
  target?: Axial
  growthStage?: GrowthStage
  popperCoord?: [number, number]
  axial?: Axial
  action?: GameActions
}

type InteractionStateReducer = (prevState: InteractionState, patch: Partial<InteractionState> | undefined) => InteractionState

export const GamePlayer: FunctionComponent<PropTypes.InferProps<typeof propTypes>> = ({ setState }) => {
  const [game] = useGame()
  const room = useRoom()
  const [interactionState, interactionStateReducer] = useReducer<InteractionStateReducer>((prevState, patch) => {
    if (patch === undefined) {
      return {}
    } else {
      return { ...prevState, ...patch }
    }
  }, {})
  if (interactionState.action === GameActions.PLANT_SEED && interactionState.popperCoord !== undefined) {
    if (game.state?.board[interactionState.axial?.toString() ?? '']?.growthStage === undefined) {
      interactionStateReducer({ target: interactionState.axial, popperCoord: undefined })
    } else {
      console.log(interactionState.axial, game.state?.board[interactionState.axial?.toString() ?? '']?.growthStage)
      interactionStateReducer({ source: interactionState.axial, popperCoord: undefined })
    }
  }
  const alert = useAlert()
  const errorHandler = useCallback((e: Error) => {
    console.log(e)
    alert(e.message)
  }, [alert])
  useEffect(() => {
    console.log(interactionState)
    if (interactionState.action === GameActions.PURCHASE && interactionState.growthStage !== undefined) {
      console.log('purchase')
      interactionStateReducer(undefined)
      game.purchase(interactionState.growthStage).catch(errorHandler)
    }
    if (interactionState.action === GameActions.END_TURN) {
      console.log('end turn')
      interactionStateReducer(undefined)
      game.endTurn().catch(errorHandler)
    }
    if (interactionState.action === GameActions.PLANT_SEED && interactionState.source !== undefined && interactionState.target !== undefined) {
      console.log('plant seed')
      interactionStateReducer(undefined)
      game.plantSeed(interactionState.source, interactionState.target).catch(errorHandler)
    }
    if (interactionState.action === GameActions.GROW_TREE && interactionState.axial !== undefined) {
      console.log('grow tree')
      interactionStateReducer(undefined)
      game.growTree(interactionState.axial).catch(errorHandler)
    }
  }, [game, interactionState, interactionStateReducer, errorHandler])
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
  const isMyTile = (axial: Axial): boolean => game.started && game.state?.board[axial.toString()].color === game.mi
  const growthStateOfTile = game.started ? game.state?.board[interactionState?.axial?.toString() ?? '']?.growthStage : undefined
  const isPreparationRound = (game.state?.preparingRound ?? 1) > 0
  const hintText: string = useMemo(() => {
    if (interactionState.action !== undefined) {
      switch (interactionState.action) {
        case GameActions.GROW_TREE:
          return !isPreparationRound && interactionState.axial === undefined ? `Select a ${interactionState.growthStage !== undefined ? GROWTH_STAGE_NAME[interactionState.growthStage] : 'tree'} to grow` : ''
        case GameActions.PLANT_SEED:
          if (interactionState.source === undefined) {
            return 'Select a tree as seed source tree'
          } else if (interactionState.target === undefined) {
            return 'Select an empty tile to plant seed'
          }
      }
    }
    return ''
  }, [isPreparationRound, interactionState])
  return (
    <Box>
      <Box sx={{ position: 'fixed', top: 0, width: '100%', textAlign: 'center' }}>{hintText}</Box>
      {game.state !== undefined && interactionState.axial !== undefined && interactionState.popperCoord !== undefined &&
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
            ? (
              <Box>
                <Box>Plant initial tree</Box>
                <Image
                  path={getTreeImageByColorGrowthStage(game.mi, GrowthStage.SHORT)}
                  onClick={() => interactionStateReducer({ action: GameActions.GROW_TREE })}
                />
              </Box>
            )
            : (
              <Flex sx={{ justifyItems: 'space-around' }}>
                {(isMyTile(interactionState.axial) || growthStateOfTile === undefined) && <Box m={1}>
                  <Box>Seed</Box>
                  <Image
                    path={getTreeImageByColorGrowthStage(game.mi, GrowthStage.SEED)}
                    onClick={() => interactionStateReducer({ action: GameActions.PLANT_SEED })}>
                    <SunlightTag>{ACTION_COST_SEED}</SunlightTag>
                  </Image>
                </Box>}
                {growthStateOfTile !== undefined && isMyTile(interactionState.axial) && <Box m={1}>
                  <Box>{growthStateOfTile === GrowthStage.TALL ? 'Harvest' : 'Grow'}</Box>
                  <Image
                    path={getTreeImageByColorGrowthStage(game.mi, growthStateOfTile)}
                    onClick={() => interactionStateReducer({ action: GameActions.GROW_TREE })}>
                    <SunlightTag>{ACTION_COST_GROW[growthStateOfTile]}</SunlightTag>
                  </Image>
                </Box>}
              </Flex>))
        }
      </Card>}
      <Flex
        sx={{
          width: '100vw',
          flexDirection: 'column',
          justifyContent: 'space-between',
          justifyItems: 'center',
          position: 'absolute',
          left: 0,
          bottom: 0
        }}>
        {
          room.started &&
          <Panel
            mi={game.mi}
            roomState={room.state}
            purchase={game.purchase.bind(game)}
            plantSeed={game.plantSeed.bind(game)}
            growTree={game.growTree.bind(game)}
            endTurn={game.endTurn.bind(game)}
            nextRound={() => {
              setState(AppState.ROOM)
            }}
            interactionStateReducer={interactionStateReducer}
          />
        }
      </Flex>
    </Box>
  )
}

GamePlayer.propTypes = propTypes
