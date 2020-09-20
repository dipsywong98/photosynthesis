import { Color, GrowthStage } from '../../3d/constants'

export interface PlayerInfo {
  lightPoint: number
  score: number
  color: Color
  availableArea: {
    [growthStage in GrowthStage]: number
  }
  playerBoard: {
    [GrowthStage.SEED]: [boolean, boolean, boolean, boolean]
    [GrowthStage.SHORT]: [boolean, boolean, boolean, boolean]
    [GrowthStage.MID]: [boolean, boolean, boolean]
    [GrowthStage.TALL]: [boolean, boolean]
  }
}
