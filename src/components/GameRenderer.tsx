import React, { FunctionComponent, useEffect, useRef } from 'react'
import { Box } from '@theme-ui/components'
import { WebGLRendererSystem } from 'ecsy-three'
import { useGame } from '../Game/GameContext'

const GameRenderer: FunctionComponent = () => {
  const ref = useRef<HTMLDivElement | null>(null)
  const [game] = useGame()
  const gameWorld = game.gameWorld

  useEffect(() => {
    const divElem = ref.current
    if (divElem !== null) {
      divElem.childNodes.forEach(child => {
        divElem.removeChild(child)
      })
      divElem.appendChild(gameWorld.renderer.domElement)
      gameWorld.world.getSystem(WebGLRendererSystem)?.onResize()
    }
  }, [ref, gameWorld.renderer.domElement, gameWorld.world])

  return (
    <Box
      ref={ref}
      sx={{
        width: '100vw',
        height: '100vh',
        position: 'absolute',
        left: 0,
        top: 0,
        right: 0,
        bottom: 0,
        canvas: {
          width: '100%',
          height: '100%'
        }
      }}
    />
  )
}

export default GameRenderer
