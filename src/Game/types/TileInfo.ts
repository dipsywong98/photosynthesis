import { Color, GrowthStage } from '../../3d/constants'

export interface TileInfo {
  stage?: GrowthStage
  color?: Color
  leaves: 4 | 3 | 2 | 1
}
