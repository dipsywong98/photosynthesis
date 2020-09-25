import { GameState } from '../types/GameState'
import { merge } from 'ramda'
import { getInitialState } from '../getInitialState'

export const gameStateFactory = (nPlayers: number, gameState: Partial<GameState> = {}): GameState => merge(getInitialState(nPlayers))(gameState)
