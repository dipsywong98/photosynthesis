import { GrowthStage } from '../3d/constants'

export const isTreeGrowthStage = (stage: GrowthStage | undefined): stage is (GrowthStage.SHORT | GrowthStage.MID | GrowthStage.TALL) => {
  return stage !== undefined && [GrowthStage.SHORT, GrowthStage.MID, GrowthStage.TALL].includes(stage)
}
