import { Color, GrowthStage } from '../../3d/constants'

export interface TileInfo {
  growthStage?: GrowthStage
  color?: Color
  leaves: number
}
