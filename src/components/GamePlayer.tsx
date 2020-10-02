import React, { FunctionComponent, useCallback, useEffect, useMemo, useReducer } from 'react'
import PropTypes from 'prop-types'
import { useGame } from '../Game/GameContext'
import { Box, Flex } from '@theme-ui/components'
import { AppState } from './App'
import { useRoom } from '../lib/RoomContext'
import { Panel } from './Panel'
import { Axial } from '../3d/Coordinates/Axial'
import { GROWTH_STAGE_NAME, GrowthStage } from '../3d/constants'
import { GameActions } from '../Game/Game'
import { useAlert } from './common/AlertContext'
import { Popper } from './Popper'

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
      <Popper interactionState={interactionState} interactionStateReducer={interactionStateReducer} game={game}/>
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
