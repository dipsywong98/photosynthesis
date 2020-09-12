import React, { FunctionComponent, useEffect, useRef } from 'react'
import PropTypes, { InferProps } from 'prop-types'
import { Box } from '@theme-ui/components'
import GameWorld from '../Game/GameWorld'
import { WebGLRendererSystem } from 'ecsy-three'

const gameRendererProps = {
  gameWorld: PropTypes.instanceOf(GameWorld).isRequired
}

const GameRenderer: FunctionComponent<InferProps<typeof gameRendererProps>> = ({ gameWorld }) => {
  const ref = useRef<HTMLDivElement | null>(null)

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
        canvas: {
          width: '100%',
          height: '100%'
        }
      }}
    />
  )
}

GameRenderer.propTypes = gameRendererProps

export default GameRenderer
