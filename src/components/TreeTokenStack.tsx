import React, { FunctionComponent, useMemo } from 'react'
import PropTypes, { InferProps } from 'prop-types'
import { ImageStack } from './common/ImageStack'
import placeholder from '../assets/images/tree-placeholder.png'
import { SunlightTag } from './SunlightTag'
import { ACTION_COST_PURCHASE, Color, GrowthStage } from '../3d/constants'

const propTypes = {
  canBuy: PropTypes.arrayOf(PropTypes.bool.isRequired).isRequired,
  growthStage: PropTypes.number.isRequired,
  color: PropTypes.number.isRequired,
  onClick: PropTypes.func
}

export const getTreeImageByColorGrowthStage = (_color: Color, _growthStage: GrowthStage): string => placeholder

export const TreeTokenStack: FunctionComponent<InferProps<typeof propTypes>> = ({ canBuy, growthStage, color, onClick }) => {
  const [stack, shouldMute] = useMemo(() => {
    const stack = canBuy.map((_, k) => (
      <SunlightTag key={k}>{ACTION_COST_PURCHASE[growthStage as GrowthStage][k]}</SunlightTag>
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
  // TODO: replace this placeholder imgPath with real tree image path, which shall depend on its color and growthStage
  return (
    <ImageStack
      stack={stack}
      shouldMute={shouldMute}
      imgPath={getTreeImageByColorGrowthStage(color, growthStage)}
      onClick={onClick}
      badge={canBuy.filter(s => s).length}
    />
  )
}

TreeTokenStack.propTypes = propTypes
