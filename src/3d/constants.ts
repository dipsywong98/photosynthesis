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
  BASSWOOD_SEED: 'basswoodSeed',
  RING: 'ring',
  LANDSCAPE: 'landscape'
} as const

export enum Color {
  BLUE,
  ORANGE,
  YELLOW,
  GREEN
}

export enum GrowthStage {
  SEED,
  SHORT,
  MID,
  TALL
}

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
export const AMBIENT_COLOR = 0x191F48
export const SUN_COLOR = 0xF8FFB2
export const SKY_COLOR = 0xcaf1fc
export const INACTIVE_COLOR = 0x333333
export const COLOR_VALUES: { [k in Color]: number } = {
  [Color.BLUE]: 0x1C77E9,
  [Color.ORANGE]: 0x1C77E9,
  [Color.YELLOW]: 0xE9D51C,
  [Color.GREEN]: 0x53E91C
}

export const SHADE_Y: { [k in GrowthStage]: number } = [-18, -10.7, -5.63, 0]

export const SUN_ANGLE = 52.725

export const TREE_TOP_Y = 10

export const TILE_SIZE = 5

export const INITIAL_SUN_ORIENTATION = 150 * Math.PI / 180

export interface TreeGrowthProp {
  tree: {
    scale: [number, number, number]
  }
  seed: {
    scale: [number, number, number]
  }
}

export const TREE_GROWTH_PROPS: { [k in GrowthStage]: TreeGrowthProp } = {
  [GrowthStage.SEED]: {
    tree: {
      scale: [0, 0, 0]
    },
    seed: {
      scale: [1, 1, 1]
    }
  },
  [GrowthStage.SHORT]: {
    tree: {
      scale: [0.333, 0.333, 0.333]
    },
    seed: {
      scale: [0, 0, 0]
    }
  },
  [GrowthStage.MID]: {
    tree: {
      scale: [0.666, 0.666, 0.666]
    },
    seed: {
      scale: [0, 0, 0]
    }
  },
  [GrowthStage.TALL]: {
    tree: {
      scale: [1, 1, 1]
    },
    seed: {
      scale: [0, 0, 0]
    }
  }
}
