import { ECSYThreeObject3D, WebGLRendererComponent } from 'ecsy-three'
import { Object3D, PerspectiveCamera, Scene, sRGBEncoding, Vector2 } from 'three'
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer'
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass'
import { OutlinePass } from 'three/examples/jsm/postprocessing/OutlinePass'
import RendererComposerComponent from '../components/RendererComposerComponent'
import GameWorldSystem from './GameWorldSystem'
import { ShaderPass } from 'three/examples/jsm/postprocessing/ShaderPass'
import { FXAAShader } from 'three/examples/jsm/shaders/FXAAShader'

export class RendererComposerSystem extends GameWorldSystem {
  private needsResize = true
  private intersectionCounter = 0

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

  execute (delta: number, time: number): void {
    this.intersectionCounter += delta

    if (!this.gameWorld.sceneHasUpdated) {
      return
    }
    this.gameWorld.sceneHasUpdated = false

    // Change renderers into composerRenderers
    this.queries.renderers.results.forEach(entity => {
      const component = entity.getComponent(WebGLRendererComponent)
      if (component === undefined) {
        return
      }

      const camera = component.camera.getObject3D() as PerspectiveCamera | undefined
      const scene = component.scene.getObject3D() as Scene | undefined
      const renderer = component.renderer

      if (scene === undefined || camera === undefined) {
        return
      }

      const canvas = renderer.domElement
      const width = canvas.clientWidth
      const height = canvas.clientHeight

      const composer = new EffectComposer(renderer)
      composer.renderTarget1.texture.encoding = sRGBEncoding
      composer.renderTarget2.texture.encoding = sRGBEncoding
      const renderPass = new RenderPass(scene, camera)
      composer.addPass(renderPass)
      const outlinePass = new OutlinePass(new Vector2(width, height), scene, camera)
      outlinePass.edgeStrength = 10
      outlinePass.edgeThickness = 2
      outlinePass.hiddenEdgeColor.set(0xFFFFFF)
      composer.addPass(outlinePass)
      const effectFXAA = new ShaderPass(FXAAShader)
      // eslint-disable-next-line
      effectFXAA.uniforms['resolution'].value.set(1 / width, 1 / height)
      composer.addPass(effectFXAA)

      entity.addComponent(RendererComposerComponent, {
        renderer,
        scene: component.scene,
        camera: component.camera,
        composer,
        outlinePass,
        effectFXAA
      })

      entity.removeComponent(WebGLRendererComponent)
    })

    this.queries.rendererComposers.results.forEach(entity => {
      const component = entity.getComponent(RendererComposerComponent)
      if (component === undefined) {
        return
      }
      const camera = component.camera.getObject3D() as PerspectiveCamera | undefined
      const scene = component.scene.getObject3D() as Scene | undefined
      const renderer = component.renderer
      const composer = component.composer
      const effectFXAA = component.effectFXAA
      const outlinePass = component.outlinePass

      if (scene === undefined || camera === undefined) {
        return
      }

      if (this.needsResize) {
        const canvas = renderer.domElement

        const curPixelRatio = renderer.getPixelRatio()

        if (curPixelRatio !== window.devicePixelRatio) {
          renderer.setPixelRatio(window.devicePixelRatio)
          composer.setPixelRatio(window.devicePixelRatio)
        }

        const width = canvas.clientWidth
        const height = canvas.clientHeight

        camera.aspect = width / height
        camera.updateProjectionMatrix()
        renderer.setSize(width, height, false)
        composer.setSize(width, height)
        outlinePass.resolution.set(width, height)
        // eslint-disable-next-line
        effectFXAA.uniforms['resolution'].value.set(1 / width, 1 / height)

        this.needsResize = false
      }

      const hoverObject = this.gameWorld.hoverObject
      const activeObject = this.gameWorld.activeObject

      outlinePass.selectedObjects = [hoverObject, activeObject !== hoverObject ? activeObject : undefined]
        .filter((x): x is (Object3D & ECSYThreeObject3D) => x !== undefined)

      composer.render()
    })
  }
}

RendererComposerSystem.queries = {
  renderers: {
    components: [WebGLRendererComponent],
    listen: {
      added: true
    }
  },
  rendererComposers: { components: [RendererComposerComponent] }
}
