import { Game } from './Game'
import { Room } from '../lib/Room'
import { gameStateFactory } from './__helper__/gameStateFactory'
import { GameState } from './types/GameState'
import { GrowthStage } from '../3d/constants'

jest.disableAutomock()

jest.mock('../lib/Room', () => ({
  Room: function () {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-expect-error
    this.network = {
      on: () => {
        //
      }
    }
  }
}))
jest.mock('./GameWorld')

describe('Game', () => {
  it('can construct', () => {
    const room = new Room()
    expect(new Game(room)).toBeTruthy()
  })

  it('can photosynthesis', () => {
    const gameState: GameState = gameStateFactory(2, {
      board: {
        '0,0': { leaves: 1, growthStage: 2, color: 0 },
        '-1,0': { leaves: 1, growthStage: 1, color: 1 },
        '-3,0': { leaves: 1, growthStage: 1, color: 0 },
        '3,0': { leaves: 1, growthStage: 3, color: 0 },
        '3,-1': { leaves: 1, growthStage: 1, color: 0 },
        '2,-1': { leaves: 1, growthStage: 1, color: 1 },
        '2,1': { leaves: 1, growthStage: 1, color: 1 },
        '1,1': { leaves: 1, growthStage: 2, color: 0 }
      },
      rayDirection: 3
    })
    const game = new Game(new Room())
    const playerInfos = game.photosynthesis(gameState).playerInfo
    expect(playerInfos[0].lightPoint).toEqual(7)
    expect(playerInfos[1].lightPoint).toEqual(1)
  })

  describe('can calculate haveSlot', () => {
    it('example: false*4', () => {
      const gameState: GameState = gameStateFactory(2)
      gameState.playerInfo[0].playerBoard[GrowthStage.SEED] = [false, false, false, false]
      const game = new Game(new Room())
      const playerInfos = game.haveSlot(gameState, 0, GrowthStage.SEED)
      expect(playerInfos).toBeTruthy()
    })
    it('example: true*4', () => {
      const gameState: GameState = gameStateFactory(2)
      gameState.playerInfo[0].playerBoard[GrowthStage.SEED] = [true, true, true, true]
      const game = new Game(new Room())
      const playerInfos = game.haveSlot(gameState, 0, GrowthStage.SEED)
      expect(playerInfos).toBeFalsy()
    })
    it('example: true*2 false*2', () => {
      const gameState: GameState = gameStateFactory(2)
      gameState.playerInfo[0].playerBoard[GrowthStage.SEED] = [false, false, true, true]
      const game = new Game(new Room())
      const playerInfos = game.haveSlot(gameState, 0, GrowthStage.SEED)
      expect(playerInfos).toBeTruthy()
    })
  })
})
