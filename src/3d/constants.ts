export const MODELS_LOCATION = '/models'

export const MODELS = {
  BLUE_TOP: 'blueTop',
  ORANGE_TOP: 'orangeTop',
  YELLOW_TOP: 'yellowTop',
  GREEN_TOP: 'greenTop',
  TRUNK: 'trunk',
  SHADE: 'shade',
  ACORN: 'acorn',
  PINE_CONE: 'pineCone',
  MAPLE_SEED: 'mapleSeed',
  BASSWOOD_SEED: 'basswoodSeed'
} as const

export enum Color {
  BLUE,
  ORANGE,
  YELLOW,
  GREEN
}

export type GrowthStage = 0 | 1 | 2 | 3

export type ModelName = typeof MODELS[keyof typeof MODELS]

export const TREE_MODELS: Record<Color, ModelName> = {
  [Color.BLUE]: MODELS.BLUE_TOP,
  [Color.ORANGE]: MODELS.ORANGE_TOP,
  [Color.YELLOW]: MODELS.YELLOW_TOP,
  [Color.GREEN]: MODELS.GREEN_TOP
} as const

export const SEED_MODELS: Record<Color, ModelName> = {
  [Color.BLUE]: MODELS.PINE_CONE,
  [Color.ORANGE]: MODELS.BASSWOOD_SEED,
  [Color.YELLOW]: MODELS.ACORN,
  [Color.GREEN]: MODELS.MAPLE_SEED
} as const

// Rendering specifics
export const shadeHeights = [-18, -10.7, -5.63, 0]

export const SUN_ANGLE = 52.6
