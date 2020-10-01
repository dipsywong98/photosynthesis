import React, { FunctionComponent, useMemo } from 'react'
import PropTypes, { InferProps } from 'prop-types'
import { ImageStack } from './common/ImageStack'
import { ACTION_COST_PURCHASE, Color, GrowthStage } from '../3d/constants'
import { SunlightBadge } from './SunlightBadge'

import seedBlue from '../assets/images/tokens/seedBlue.png'
import shortBlue from '../assets/images/tokens/shortBlue.png'
import midBlue from '../assets/images/tokens/midBlue.png'
import tallBlue from '../assets/images/tokens/tallBlue.png'

import seedGreen from '../assets/images/tokens/seedGreen.png'
import shortGreen from '../assets/images/tokens/shortGreen.png'
import midGreen from '../assets/images/tokens/midGreen.png'
import tallGreen from '../assets/images/tokens/tallGreen.png'

import seedOrange from '../assets/images/tokens/seedOrange.png'
import shortOrange from '../assets/images/tokens/shortOrange.png'
import midOrange from '../assets/images/tokens/midOrange.png'
import tallOrange from '../assets/images/tokens/tallOrange.png'

import seedYellow from '../assets/images/tokens/seedYellow.png'
import shortYellow from '../assets/images/tokens/shortYellow.png'
import midYellow from '../assets/images/tokens/midYellow.png'
import tallYellow from '../assets/images/tokens/tallYellow.png'

const TREE_TOKENS_BLUE = {
  [GrowthStage.SEED]: seedBlue,
  [GrowthStage.SHORT]: shortBlue,
  [GrowthStage.MID]: midBlue,
  [GrowthStage.TALL]: tallBlue
}

const TREE_TOKENS_GREEN = {
  [GrowthStage.SEED]: seedGreen,
  [GrowthStage.SHORT]: shortGreen,
  [GrowthStage.MID]: midGreen,
  [GrowthStage.TALL]: tallGreen
}

const TREE_TOKENS_ORANGE = {
  [GrowthStage.SEED]: seedOrange,
  [GrowthStage.SHORT]: shortOrange,
  [GrowthStage.MID]: midOrange,
  [GrowthStage.TALL]: tallOrange
}

const TREE_TOKENS_YELLOW = {
  [GrowthStage.SEED]: seedYellow,
  [GrowthStage.SHORT]: shortYellow,
  [GrowthStage.MID]: midYellow,
  [GrowthStage.TALL]: tallYellow
}

const TREE_TOKENS = {
  [Color.BLUE]: TREE_TOKENS_BLUE,
  [Color.GREEN]: TREE_TOKENS_GREEN,
  [Color.ORANGE]: TREE_TOKENS_ORANGE,
  [Color.YELLOW]: TREE_TOKENS_YELLOW
}

const propTypes = {
  canBuy: PropTypes.arrayOf(PropTypes.bool.isRequired).isRequired,
  growthStage: PropTypes.number.isRequired,
  color: PropTypes.number.isRequired,
  onClick: PropTypes.func
}

export const getTreeImageByColorGrowthStage = (color: Color, growthStage: GrowthStage): string => TREE_TOKENS[color][growthStage]

export const TreeTokenStack: FunctionComponent<InferProps<typeof propTypes>> = ({ canBuy, growthStage, color, onClick }) => {
  const [stack, shouldMute] = useMemo(() => {
    const stack = canBuy.map((_, k) => (
      <SunlightBadge
        key={k}
        sx={{
          top: 0,
          right: '-4px',
          position: 'absolute'
        }}>
        {ACTION_COST_PURCHASE[growthStage as GrowthStage][k]}
      </SunlightBadge>
    ))
    if (!canBuy[0]) {
      const k = canBuy.indexOf(true)
      if (k !== -1) {
        const tag = stack.splice(k, 1)
        const shouldMute = [...canBuy]
        shouldMute[0] = true
        shouldMute[k] = false
        return [[tag, ...stack], shouldMute]
      }
    }
    return [stack, canBuy]
  }, [canBuy, growthStage])
  return (
    <ImageStack
      stack={stack}
      enabled={shouldMute}
      imgPath={getTreeImageByColorGrowthStage(color, growthStage)}
      onClick={onClick}
      badge={canBuy.filter(s => s).length}
    />
  )
}

TreeTokenStack.propTypes = propTypes
