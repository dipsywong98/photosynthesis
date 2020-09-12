import { ECSYThreeWorld, initialize, Object3DComponent } from 'ecsy-three'
import { Entity } from 'ecsy'
import {
  AmbientLight,
  DirectionalLight,
  Group,
  Object3D,
  PerspectiveCamera,
  sRGBEncoding,
  VSMShadowMap,
  WebGLRenderer
} from 'three'
import TreeSystem from './systems/TreeSystem'
import TweenSystem from './systems/TweenSystem'
import { disposeObj3D } from '../3d/helpers'
import TreeComponent from './components/TreeComponent'
import TweenBaseComponent from './components/TweenBaseComponent'
import TweenObject3DComponent from './components/TweenObject3DComponent'
import TweenMaterialComponent from './components/TweenMaterialComponent'
import AxialCoordsComponent from './components/AxialCoordsComponent'
import { AMBIENT_COLOR, MODELS, SKY_COLOR, SUN_ANGLE, SUN_COLOR } from '../3d/constants'
import { getObject } from '../3d/assets'
import HexCube from '../3d/Coordinates/HexCube'
import TileComponent from './components/TileComponent'
import AxialCoordsSystem from './systems/AxialCoordsSystem'
import TileSystem from './systems/TileSystem'

export default class GameWorld {
  renderer: WebGLRenderer
  world: ECSYThreeWorld
  sceneEntity?: Entity
  camera?: PerspectiveCamera
  messages: Record<string, unknown[]> = {}

  constructor () {
    this.renderer = new WebGLRenderer()
    this.world = new ECSYThreeWorld()
    this.resetWorld()
  }

  public resetWorld (): void {
    this.world.stop()
    disposeObj3D(this.sceneEntity?.getComponent(Object3DComponent)?.value)
    const {
      camera,
      sceneEntity
    } = initialize(this.world, {
      renderer: this.renderer
    })
    this.camera = camera
    this.sceneEntity = sceneEntity

    this.initRenderer()
    this.initECS()
    this.initScene()
    this.world.play()
  }

  private initECS (): void {
    this.world.registerComponent(TreeComponent)
    this.world.registerComponent(TweenBaseComponent)
    this.world.registerComponent(TweenObject3DComponent)
    this.world.registerComponent(TweenMaterialComponent)
    this.world.registerComponent(AxialCoordsComponent)
    this.world.registerComponent(TileComponent)

    // Replace default renderer system
    // this.world.unregisterSystem(WebGLRendererSystem)
    // this.world.registerSystem(MyWebGLRendererSystem, { priority: 999 })

    this.world.registerSystem(AxialCoordsSystem)
    this.world.registerSystem(TileSystem)
    this.world.registerSystem(TreeSystem)
    this.world.registerSystem(TweenSystem)
  }

  private initRenderer (): void {
    this.renderer.shadowMap.enabled = true
    this.renderer.shadowMap.type = VSMShadowMap
    this.renderer.setClearColor(SKY_COLOR)
    this.renderer.outputEncoding = sRGBEncoding
  }

  private initScene (): void {
    if (this.camera !== undefined) {
      this.camera.position.set(25, 20, 25)
      this.camera.rotation.y = 0.67
    }

    const ambientLight = new AmbientLight(AMBIENT_COLOR, 0.5)
    const sun = new DirectionalLight(SUN_COLOR, 1)
    sun.position.set(0, Math.sin(SUN_ANGLE) * 100, 100)
    sun.castShadow = true
    sun.shadow.camera.visible = true
    sun.shadow.bias = -0.0005
    sun.shadow.radius = 32
    sun.shadow.camera.near = 10
    sun.shadow.camera.far = 150
    sun.shadow.camera.top = -10
    sun.shadow.camera.bottom = 20
    sun.shadow.mapSize.set(2 ** 11, 2 ** 11)
    const sunContainer = new Group()
    sunContainer.name = 'sun'
    sunContainer.add(sun)

    const sky = new DirectionalLight(0xFFFFFF, 0.2)
    sky.name = 'sky'
    sky.castShadow = true
    sky.shadow.bias = -0.0005
    sky.shadow.radius = 128
    sky.shadow.camera.near = 10
    sky.shadow.camera.far = 150
    sky.shadow.mapSize.set(2 ** 12, 2 ** 12)
    sky.position.y = 100

    const commonLights = new Group()
    commonLights.name = 'commonLights'
    commonLights.add(ambientLight, sky)

    const floorObj = new Object3D()
    getObject(MODELS.LANDSCAPE).then(obj => floorObj.add(obj.clone())).catch(console.error)
    floorObj.name = 'floor'

    this.world
      .createEntity()
      .addObject3DComponent(floorObj, this.sceneEntity)

    this.world
      .createEntity()
      .addObject3DComponent(commonLights, this.sceneEntity)

    this.world
      .createEntity()
      .addObject3DComponent(sunContainer, this.sceneEntity)

    this.generateGrid()
  }

  private generateGrid (): void {
    getObject(MODELS.RING).then(ring => {
      for (let i = 0; i < 4; i++) {
        new HexCube(0, 0, 0).range(i).forEach(hexCube => {
          console.log(hexCube)
          this.world
            .createEntity()
            .addObject3DComponent(ring.clone(), this.sceneEntity)
            .addComponent(TileComponent)
            .addComponent(AxialCoordsComponent, { position: hexCube.toAxial() })
        })
      }
    }).catch(console.error)
  }

  /**
   * Send and receive messages between main game logic and ECS
   * @param target Recipient
   * @param message Message to recipient
   */
  public send (target: string, message: unknown): void {
    const queue = this.messages[target] ?? []

    if (this.messages[target] === undefined) {
      this.messages[target] = queue
    }

    queue.push(message)
  }
}
