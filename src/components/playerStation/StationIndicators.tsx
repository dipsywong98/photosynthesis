import React, { VFC } from 'react'
import { GameContext } from '../../Game/GameContext'
import { Color } from '../../3d/constants'
import StationIndicator from './StationIndicator'
import { Flex } from '@theme-ui/components'

interface StationIndicatorsProps {
  onPlayerSelect: (color: Color) => void
}

const StationIndicators: VFC<StationIndicatorsProps> = ({ onPlayerSelect }) => (
  <Flex sx={{ position: 'absolute', flexDirection: 'row', bottom: 0, pointerEvents: 'none', justifyContent: 'center', width: '100vw' }}>
    <GameContext.Consumer>
      {([game]) => [...(game.state?.playerInfo?.keys() ?? [])].map((color: Color) => (
        <StationIndicator key={color} playerColor={color} onClick={() => onPlayerSelect(color)}/>
      ))}
    </GameContext.Consumer>
  </Flex>
)

export default StationIndicators
