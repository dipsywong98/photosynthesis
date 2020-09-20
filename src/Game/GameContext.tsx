import React, { createContext, FunctionComponent, useContext, useEffect, useState } from 'react'
import { Game, GameEvent, GameState } from './Game'
import PropTypes from 'prop-types'
import { globalRoom, useRoom } from '../lib/RoomContext'

export const GameContext = createContext<[Game, GameState | undefined, string|undefined]>([globalRoom.game, undefined, undefined])
export const useGame = (): [Game, GameState | undefined, string|undefined] => useContext(GameContext)

export const GameContextProvider: FunctionComponent = (props) => {
  const game = useRoom().game
  const [gameState, setGameState] = useState<GameState|undefined>(undefined)
  const [gameOver, setGameOver] = useState<string|undefined>(undefined)
  useEffect(() => {
    setGameState(undefined)
    game.on(GameEvent.UPDATE_GAME_STATE, ({ data }) => {
      const state = data as GameState
      setGameOver(state?.gameOver)
      setGameState({ ...state })
    })
    game.on(GameEvent.GAME_OVER, ({ data }) => setGameOver(data as string))
  }, [game])
  return <GameContext.Provider value={[game, gameState, gameOver]} {...props} />
}

GameContextProvider.propTypes = {
  value: PropTypes.any
}
