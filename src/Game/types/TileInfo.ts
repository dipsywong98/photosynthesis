import { Color, GrowthStage } from '../../3d/constants'

export interface TileInfo {
  stage?: GrowthStage
  color?: Color
  leaves: number
}
