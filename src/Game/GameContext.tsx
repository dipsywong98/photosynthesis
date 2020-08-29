import React, {createContext, FunctionComponent, useContext, useEffect, useState} from 'react'
import {Game, GameEvent} from './Game'

export const GameContext = createContext<[Game|null, any]>([null, null])
export const useGame = () => useContext(GameContext)
export const useGameState = () => useContext(GameContext)?.[1]

export const GameContextProvider: FunctionComponent<{value: Game | null}> = ({value: game, ...props}) => {
  const [gameState, setGameState] = useState(null)
  useEffect(() => {
    setGameState(null)
    game?.on(GameEvent.UPDATE_GAME_STATE, setGameState)
  }, [game])
  return <GameContext.Provider value={[game, {...game?.state}]} {...props} />
}
