import GameWorldSystem from './GameWorldSystem'
import Hammer from 'hammerjs'

export default class TouchSystem extends GameWorldSystem {
  hm!: HammerManager
  panDistances: Array<[number, number]> = []

  private readonly setXY = ({ x, y }: { x: number, y: number }): void => {
    this.gameWorld.mouseScreenPosition.x = (x / window.innerWidth) * 2 - 1
    this.gameWorld.mouseScreenPosition.y = -(y / window.innerHeight) * 2 + 1

    this.gameWorld.hasMouseMoved = true
  }

  private readonly onMouseMove = (event: TouchEvent | MouseEvent): void => {
    let x, y

    if (event instanceof MouseEvent) {
      x = event.clientX
      y = event.clientY
    } else {
      x = event.changedTouches[0].pageX
      y = event.changedTouches[0].pageY
    }

    this.setXY({ x, y })
  }

  init (): void {
    const canvas = this.gameWorld.renderer.domElement

    this.hm = new Hammer(canvas)
    this.hm.add(new Hammer.Pan({ direction: Hammer.DIRECTION_ALL }))
    this.hm.on('pan', ({ velocityX, velocityY }) => {
      this.panDistances.push([velocityX, velocityY])
    })
    this.hm.on('tap', ({ center }) => {
      this.setXY(center)
      this.gameWorld.willSelectObject = true
    })
    this.hm.on('pinch', ({ scale }) => {
      this.gameWorld.camera.position.z = Math.max(0.999, Math.min(this.gameWorld.camera.position.z * (scale), 4))
    })

    canvas.addEventListener('touchmove', this.onMouseMove)
    canvas.addEventListener('mousemove', this.onMouseMove)
  }

  dispose (): void {
    this.hm.destroy()
  }

  execute (delta: number, time: number): void {
    let panDistance
    while ((panDistance = this.panDistances.pop()) !== undefined) {
      const [hDistance, vDistance] = panDistance
      this.gameWorld.cameraRotationObj.rotation.y -= hDistance * 0.1

      const newTilt = this.gameWorld.cameraTiltObj.rotation.x - vDistance * 0.05
      this.gameWorld.cameraTiltObj.rotation.x = Math.max(-Math.PI / 2, Math.min(-0.1, newTilt))

      this.gameWorld.sceneHasUpdated = true
    }
  }
}
