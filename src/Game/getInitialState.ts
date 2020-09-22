import { clone } from 'ramda'
import { Color, GrowthStage } from '../3d/constants'
import { PlayerInfo } from './types/PlayerInfo'
import { GameState } from './types/GameState'
import { TileMap } from './types/TileMap'
import HexCube from '../3d/Coordinates/HexCube'

const getInitialPlayerInfo = (color: Color): PlayerInfo => clone({
  lightPoint: 0,
  score: 0,
  color,
  availableArea: {
    [GrowthStage.SEED]: 2,
    [GrowthStage.SHORT]: 4,
    [GrowthStage.MID]: 1,
    [GrowthStage.TALL]: 0
  },
  playerBoard: {
    [GrowthStage.SEED]: [true, true, true, true],
    [GrowthStage.SHORT]: [true, true, true, true],
    [GrowthStage.MID]: [true, true, true],
    [GrowthStage.TALL]: [true, true]
  }
})

const getInitialBoard = (): TileMap => {
  const map: TileMap = {}
  for (let i = 0; i < 4; i++) {
    new HexCube(0, 0, 0).range(i).forEach(hexCube => {
      map[hexCube.toAxial().toString()] = {
        leaves: 4 - i
      }
    })
  }
  return map
}

export const getInitialState = (players: number): GameState => {
  const state: GameState = {
    preparingRound: true,
    dirtyTiles: [],
    turn: 0,
    rayDirection: 0,
    revolutionLeft: 3,
    board: getInitialBoard(),
    scoreTokens: {
      1: [14, 14, 13, 13, 13, 12, 12, 12, 12],
      2: [17, 16, 16, 14, 14, 13, 13, 13],
      3: [19, 18, 18, 17, 17],
      4: [22, 21, 20]
    },
    playerInfo: []
  }
  for (let id = 0; id < players; id++) {
    state.playerInfo[id] = getInitialPlayerInfo(id)
  }
  if (players === 2) {
    state.scoreTokens[3] = []
  }
  return state
}
