import { System } from 'ecsy'
import { WebGLRendererComponent } from 'ecsy-three'
import { PerspectiveCamera } from 'three'

export class MyWebGLRendererSystem extends System {
  private needsResize = true

  onResize (): void {
    this.needsResize = true
  }

  init (): void {
    this.needsResize = true
    this.onResize = this.onResize.bind(this)
    window.addEventListener('resize', this.onResize.bind(this), false)
  }

  dispose (): void {
    window.removeEventListener('resize', this.onResize.bind(this))
  }

  execute (): void {
    const entities = this.queries.renderers.results

    for (let i = 0; i < entities.length; i++) {
      const entity = entities[i]
      const component = entity.getComponent(WebGLRendererComponent)
      if (component === undefined) {
        break
      }
      const camera = component.camera.getObject3D?.() as PerspectiveCamera
      const scene = component.scene.getObject3D?.()
      const renderer = component.renderer

      if (camera === undefined || scene === undefined) {
        break
      }

      if (this.needsResize) {
        const canvas = renderer.domElement

        const width = canvas.clientWidth
        const height = canvas.clientHeight

        camera.aspect = width / height
        camera.updateProjectionMatrix()
        renderer.setSize(width, height, false)

        this.needsResize = false
      }

      renderer.render(scene, camera)
    }
  }
}

MyWebGLRendererSystem.queries = {
  renderers: { components: [WebGLRendererComponent] }
}
