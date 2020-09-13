import { ECSYThreeSystem, ECSYThreeWorld } from 'ecsy-three'
import GameWorld from '../GameWorld'
import { GameWorldAttributes } from '../types/GameWorldAttributes'

export default abstract class GameWorldSystem extends ECSYThreeSystem {
  protected readonly gameWorld: GameWorld

  public constructor (world: ECSYThreeWorld, attributes?: GameWorldAttributes) {
    super(world, attributes)
    if (attributes?.gameWorld === undefined) {
      throw new Error('Game world must be provided')
    }
    this.gameWorld = attributes?.gameWorld
  }
}
