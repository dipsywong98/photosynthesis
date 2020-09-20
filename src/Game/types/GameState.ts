import { TileMap } from './TileMap'
import { PlayerInfo } from './PlayerInfo'

export interface GameState {
  turn: number
  rayDirection: number
  revolutionLeft: number
  gameOver?: string
  board: TileMap
  playerInfo: {
    [playerId: string]: PlayerInfo
  }
  scoreTokens: [number[], number[], number[], number[]]
}
