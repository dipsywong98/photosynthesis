import { TileMap } from './TileMap'
import { PlayerInfo } from './PlayerInfo'

export interface GameState {
  preparingRound: number
  dirtyTiles: string[]
  turn: number
  rayDirection: number
  revolutionLeft: number
  gameOver?: string
  board: TileMap
  playerInfo: PlayerInfo[]
  scoreTokens: Record<number, number[]>
  photosynthesisHints: []
}
