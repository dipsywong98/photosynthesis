import { Color, GrowthStage } from '../../3d/constants'
import React, { VFC } from 'react'
import { useColorMode } from '@theme-ui/color-modes'
import { useBreakpointIndex } from '@theme-ui/match-media'
import { colorsFromPlayerColor } from '../../utils/colors'
import { Box } from '@theme-ui/components'
import Token from './Token'
import { getTreeImageByColorGrowthStage } from '../TreeTokenStack'
import { SunlightBadge } from '../SunlightBadge'

interface TreeSlotProps {
  size: number[]
  isAvailable: boolean
  color: Color
  growthStage: GrowthStage
  costingPoints: number
  myPoints: number
}

export const TreeSlot: VFC<TreeSlotProps> = ({ size, isAvailable, color, growthStage, costingPoints, myPoints }) => {
  const [colorMode] = useColorMode()
  const currentBreakpointIndex = useBreakpointIndex()

  const [, text] = colorsFromPlayerColor(colorMode, color)

  return (
    <Box
      sx={{
        position: 'relative',
        margin: ['4px', '8px'],
        width: size,
        height: size,
        borderRadius: '100%',
        borderColor: text,
        borderWidth: '1px',
        borderStyle: 'solid',
        backgroundColor: isAvailable ? text : 'transparent'
      }}>
      {
        isAvailable
          ? (
            <Token
              size={size[currentBreakpointIndex >= size.length ? size.length - 1 : currentBreakpointIndex]}
              url={getTreeImageByColorGrowthStage(color, growthStage)}
            />
            )
          : null
      }
      <SunlightBadge
        myPoints={myPoints}
        sx={{
          top: 0,
          right: '-4px',
          position: 'absolute',
          pointerEvents: 'none'
        }}>
        {costingPoints}
      </SunlightBadge>
    </Box>
  )
}
