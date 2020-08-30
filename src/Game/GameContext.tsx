import React, { createContext, FunctionComponent, useContext, useEffect, useState } from 'react'
import { Game, GameEvent, GameState } from './Game'
import PropTypes from 'prop-types'

export const GameContext = createContext<[Game | undefined, GameState | undefined]>([undefined, undefined])
export const useGame = (): [Game | undefined, GameState | undefined] => useContext(GameContext)

export const GameContextProvider: FunctionComponent<{ value: (Game | undefined) }> = ({ value: game, ...props }) => {
  const [gameState, setGameState] = useState<GameState|undefined>(undefined)
  useEffect(() => {
    setGameState(undefined)
    game?.on(GameEvent.UPDATE_GAME_STATE, ({ data }) => setGameState(data as GameState))
  }, [game])
  return <GameContext.Provider value={[game, gameState]} {...props} />
}

GameContextProvider.propTypes = {
  value: PropTypes.any
}
