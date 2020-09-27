import React, { FunctionComponent, useMemo } from 'react'
import PropTypes, { InferProps } from 'prop-types'
import { Stack } from './common/Stack'
import placeholder from '../assets/images/tree-placeholder.png'
import { SunlightTag } from './SunlightTag'
import { ACTION_COST_PURCHASE, GrowthStage } from '../3d/constants'

const propTypes = {
  canBuy: PropTypes.arrayOf(PropTypes.bool.isRequired).isRequired,
  growthStage: PropTypes.number.isRequired,
  color: PropTypes.number.isRequired,
  onClick: PropTypes.func
}

export const TreeTokenStack: FunctionComponent<InferProps<typeof propTypes>> = ({ canBuy, growthStage, onClick }) => {
  const stack = useMemo(() => canBuy.map((canBuy, k) => (
    canBuy
      ? <SunlightTag key={k}>{ACTION_COST_PURCHASE[growthStage as GrowthStage][k]}</SunlightTag>
      : '-'
  )), [canBuy, growthStage])
  // TODO: replace this placeholder imgPath with real tree image path, which shall depend on its color and growthStage
  return (
    <Stack stack={stack} imgPath={placeholder} onClick={onClick} badge={canBuy.filter(s => s).length}/>
  )
}

TreeTokenStack.propTypes = propTypes
