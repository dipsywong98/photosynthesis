import { Color, GrowthStage } from '../../3d/constants'

export interface TileInfo {
  treeType?: GrowthStage
  color?: Color
  leaves: number
}
