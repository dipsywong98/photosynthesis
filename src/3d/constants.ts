import { Vector3 } from 'three'

export const TAU = Math.PI * 2

export const MODELS_LOCATION = process.env.PUBLIC_URL + '/models'
export const IMAGES_LOCATION = process.env.PUBLIC_URL + '/images'

export const MODELS = {
  BLUE_TOP: 'blueTop',
  ORANGE_TOP: 'orangeTop',
  YELLOW_TOP: 'yellowTop',
  GREEN_TOP: 'greenTop',
  TRUNK: 'trunk',
  SHADE: 'shade',
  GROUND_SHADE: 'groundShade',
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
  [Color.ORANGE]: 0xD9311A,
  [Color.YELLOW]: 0xE9D51C,
  [Color.GREEN]: 0x53E91C
}

export const SHADE_Y: { [k in GrowthStage]: number } = [-18, -10.7, -5.63, 0]
export const SUN_ANGLE = 52.725
export const TREE_TOP_Y = 10
export const TILE_SIZE = 5
export const INITIAL_SUN_ORIENTATION = 1.50 * Math.PI
export const GROUND_SHADE_HIDDEN_ROTATION = -0.8
export const SUN_SEGMENT_SIZE = 56
export const SUN_SEGMENT_POSITION_Y = 2.2
export const SUN_SEGMENT_POSITION_Z = SUN_SEGMENT_SIZE / 2

export interface TreeGrowthProp {
  tree: { scale: Vector3 }
  seed: { scale: Vector3 }
}

export const TREE_GROWTH_PROPS: { [k in GrowthStage]: TreeGrowthProp } = {
  [GrowthStage.SEED]: {
    tree: {
      scale: new Vector3(0, 0, 0)
    },
    seed: {
      scale: new Vector3(1, 1, 1)
    }
  },
  [GrowthStage.SHORT]: {
    tree: {
      scale: new Vector3(0.333, 0.333, 0.333)
    },
    seed: {
      scale: new Vector3(0, 0, 0)
    }
  },
  [GrowthStage.MID]: {
    tree: {
      scale: new Vector3(0.666, 0.666, 0.666)
    },
    seed: {
      scale: new Vector3(0, 0, 0)
    }
  },
  [GrowthStage.TALL]: {
    tree: {
      scale: new Vector3(1, 1, 1)
    },
    seed: {
      scale: new Vector3(0, 0, 0)
    }
  }
}

// Animations
export const TREE_GROWTH_DURATION = 1.5
export const GROUND_SHADE_DURATION = TREE_GROWTH_DURATION / 3 * 2
export const SUN_ROTATION_DURATION = 2

// UI
export const CAMERA_INITIAL_POSITION = 95
export const CAMERA_MIN_ZOOM_DISTANCE = 20
export const CAMERA_MAX_ZOOM_DISTANCE = 300
export const CAMERA_FURTHEST_DISTANCE = 325

// Gameplay
export const ACTION_COST_SEED = 1

export const ACTION_COST_GROW: { [k in GrowthStage]: number } = {
  [GrowthStage.SEED]: 1,
  [GrowthStage.SHORT]: 2,
  [GrowthStage.MID]: 3,
  [GrowthStage.TALL]: 4
} as const

export const ACTION_COST_PURCHASE: { [k in GrowthStage]: readonly number[] } = {
  [GrowthStage.SEED]: [1, 1, 2, 2],
  [GrowthStage.SHORT]: [2, 2, 3, 3],
  [GrowthStage.MID]: [3, 3, 4],
  [GrowthStage.TALL]: [4, 5]
} as const

export const IMAGE_SIZE = 50
export const IMAGE_SIZE_CSS = `${IMAGE_SIZE}px`

export const GROWTH_STAGE_NAME: { [k in GrowthStage]: string } = {
  [GrowthStage.SEED]: 'seed',
  [GrowthStage.SHORT]: 'short tree',
  [GrowthStage.MID]: 'middle tree',
  [GrowthStage.TALL]: 'tall tree'
}
