import React, { useEffect, useState, VFC } from 'react'
import { useGame } from '../../Game/GameContext'
import StationIndicators from './StationIndicators'
import Station from './Station'
import { InteractionState } from '../GamePlayer'
import { Color } from '../../3d/constants'

interface StationHUDProps {
  interactionStateReducer: (patch: Partial<InteractionState> | undefined) => void
}

const StationHUD: VFC<StationHUDProps> = ({ interactionStateReducer }) => {
  const [game] = useGame()
  const [selectedPlayer, setSelectedPlayer] = useState<Color|null>(null)

  useEffect(() => {
    if (game.started) {
      setSelectedPlayer(game.mi)
    }
    // eslint-disable-next-line
  }, [game.started])

  const state = game.state

  if (!game.started || state === undefined || selectedPlayer === null) {
    return null
  }

  return (
    <>
      <StationIndicators onPlayerSelect={setSelectedPlayer}/>
      <Station playerColor={selectedPlayer} interactionStateReducer={interactionStateReducer}/>
    </>
  )
}

export default StationHUD
