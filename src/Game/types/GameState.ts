import { TileMap } from './TileMap'
import { PlayerInfo } from './PlayerInfo'

export interface GameState {
  preparingRound: boolean
  dirtyTiles: string[]
  turn: number
  rayDirection: number
  revolutionLeft: number
  gameOver?: string
  board: TileMap
  playerInfo: PlayerInfo[]
  scoreTokens: { 1: number[], 2: number[], 3: number[], 4: number[] }
}
