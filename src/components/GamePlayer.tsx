import React, { FunctionComponent, useCallback, useMemo, useState } from 'react'
import PropTypes from 'prop-types'
import { useGame } from '../Game/GameContext'
import { Box, Flex, Heading, Text } from '@theme-ui/components'
import { AppState } from './App'
import { useRoom } from '../lib/RoomContext'
import { Panel } from './Panel'
import { Axial } from '../3d/Coordinates/Axial'
import { Color, COLOR_VALUES, GROWTH_STAGE_NAME, GrowthStage } from '../3d/constants'
import { GameActions } from '../Game/Game'
import { useAlert } from './common/AlertContext'
import { Popper } from './Popper'
import { Card } from './common/Card'
import { SLOW, transition } from '../theme/transitions'
import Button from './common/Button'
import { useConfirm } from './common/ConfirmContext'

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

export const GamePlayer: FunctionComponent<PropTypes.InferProps<typeof propTypes>> = ({ setState }) => {
  const [game] = useGame()
  const room = useRoom()
  const confirm = useConfirm()
  const [interactionState, setInteractionState] = useState<InteractionState>({})
  const interactionStateReducer = (patch: Partial<InteractionState> | undefined): void => {
    let newState = patch === undefined ? {} : { ...interactionState, ...patch }
    if (newState.action === GameActions.PLANT_SEED && newState.popperCoord !== undefined) {
      if (game.state?.board[newState.axial?.toString() ?? '']?.growthStage === undefined) {
        newState = { ...newState, target: newState.axial, popperCoord: undefined }
      } else {
        newState = { ...newState, source: newState.axial, popperCoord: undefined }
      }
    }
    if (newState.action === GameActions.PURCHASE && newState.growthStage !== undefined) {
      console.log('purchase')
      game.purchase(newState.growthStage).catch(errorHandler)
      newState = {}
    }
    if (newState.action === GameActions.END_TURN) {
      console.log('end turn')
      game.endTurn().catch(errorHandler)
      newState = {}
    }
    if (newState.action === GameActions.PLANT_SEED && newState.source !== undefined && newState.target !== undefined) {
      console.log('plant seed')
      game.plantSeed(newState.source, newState.target).catch(errorHandler)
      newState = {}
    }
    if (newState.action === GameActions.GROW_TREE && newState.axial !== undefined) {
      console.log('grow tree')
      const growthStageOfTile: GrowthStage | undefined = game.state?.board[newState.axial.toString()]?.growthStage
      console.log('have slot', growthStageOfTile !== undefined, game.state !== undefined, growthStageOfTile !== undefined && game.state !== undefined && !game.haveSlot(game.state, game.mi, growthStageOfTile))
      if (growthStageOfTile !== undefined && game.state !== undefined && !game.haveSlot(game.state, game.mi, growthStageOfTile)) {
        confirm(`No empty slots on your purchase board. Proceed and lose your ${GROWTH_STAGE_NAME[growthStageOfTile]}`)
          .then((yes) => {
            if (yes && newState.axial !== undefined) {
              game.growTree(newState.axial).catch(errorHandler)
            }
            setInteractionState({})
          }).catch(errorHandler)
      } else {
        game.growTree(newState.axial).catch(errorHandler)
        newState = {}
      }
    }
    setInteractionState(newState)
  }
  const alert = useAlert()
  const errorHandler = useCallback((e: Error) => {
    console.log(e)
    alert(e.message)
  }, [alert])
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
  const nextRound = (): void => {
    game.gameWorld.resetBoard()
    setState(AppState.ROOM)
  }
  const gameOver = game.state?.gameOver
  const flag = gameOver !== undefined
  return (
    <Box>
      {game.started && (
        <Box
          sx={{
            position: 'fixed',
            top: 0,
            right: 0,
            left: 0,
            bottom: 0,
            pointerEvents: 'none',
            boxShadow: (hintText !== '' ? `inset 0 0 100px #${COLOR_VALUES[game.mi as Color].toString(16)}` : undefined),
            ...transition(SLOW, ['box-shadow'])
          }}
        />)
      }
      <Heading sx={{ position: 'fixed', top: 0, width: '100%', textAlign: 'center' }}>{hintText}</Heading>
      <Popper interactionState={interactionState} interactionStateReducer={interactionStateReducer} game={game}/>
      <Card
        sx={{
          position: 'fixed',
          top: (flag ? '50%' : '200%'),
          left: '50%',
          transform: 'translate(-50%, -50%)',
          ...transition(SLOW, ['top'])
        }}>
        <Heading>Game Over</Heading>
        <Text>{gameOver}</Text>
        <Button variant='primary' mt={3} onClick={nextRound}>New Game</Button>
      </Card>
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
        <Panel
          mi={game.started ? game.mi : undefined}
          roomState={room.state}
          interactionStateReducer={interactionStateReducer}
        />
      </Flex>
    </Box>
  )
}

GamePlayer.propTypes = propTypes
