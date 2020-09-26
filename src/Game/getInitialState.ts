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
  new HexCube(0, 0, 0).range(3).forEach(hexCube => {
    const i = hexCube.tileDistance(HexCube.origin)
    map[hexCube.toAxial().toString()] = {
      leaves: 4 - i as 1 | 2 | 3 | 4
    }
  })
  return map
}

export const getInitialState = (players: number): GameState => {
  const state: GameState = {
    preparingRound: 2,
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
    playerInfo: [],
    photosynthesisHints: []
  }
  for (let id = 0; id < players; id++) {
    state.playerInfo[id] = getInitialPlayerInfo(id)
  }
  if (players === 2) {
    state.scoreTokens[3] = []
  }
  return state
}
