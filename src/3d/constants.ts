export const MODELS_LOCATION = '/models'

export const MODELS = {
  BLUE_TOP: 'blueTop',
  ORANGE_TOP: 'orangeTop',
  YELLOW_TOP: 'yellowTop',
  GREEN_TOP: 'greenTop',
  TRUNK: 'trunk',
  SHADE: 'shade'
} as const

export const TREE_MODELS = {
  BLUE: MODELS.BLUE_TOP,
  ORANGE: MODELS.ORANGE_TOP,
  YELLOW: MODELS.YELLOW_TOP,
  GREEN: MODELS.GREEN_TOP
} as const

export const shadeHeights = [-18, -10.7, -5.63, 0]

export type TreeType = keyof typeof TREE_MODELS

export type GrowthStage = 0 | 1 | 2 | 3

export const SUN_ANGLE = 52.6
