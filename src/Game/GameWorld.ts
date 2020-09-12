import { ECSYThreeWorld, initialize, Object3DComponent } from 'ecsy-three'
import { Entity } from 'ecsy'
import {
  AmbientLight,
  CircleBufferGeometry,
  DirectionalLight,
  Group,
  Mesh,
  MeshPhongMaterial,
  Object3D,
  PerspectiveCamera,
  ShadowMaterial,
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
import HexCoordsComponent from './components/HexCoordsComponent'
import { AMBIENT_COLOR, SKY_COLOR, SUN_ANGLE, SUN_COLOR } from '../3d/constants'

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
    this.world.registerComponent(HexCoordsComponent)

    // Replace default renderer system
    // this.world.unregisterSystem(WebGLRendererSystem)
    // this.world.registerSystem(MyWebGLRendererSystem, { priority: 999 })

    this.world.registerSystem(TreeSystem)

    this.world.registerSystem(TweenSystem)
  }

  private initRenderer (): void {
    this.renderer.shadowMap.enabled = true
    this.renderer.shadowMap.type = VSMShadowMap
    this.renderer.setClearColor(SKY_COLOR)
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

    const floorGeometry = new CircleBufferGeometry(500, 32)
    const floorMesh = new Mesh(
      floorGeometry,
      new MeshPhongMaterial({
        color: 0x9AC640,
        specular: 0.5
      })
    )
    floorMesh.receiveShadow = false
    const floorMeshShadow = new Mesh(
      floorGeometry,
      new ShadowMaterial({
        color: 0x194B21
      })
    )
    floorMeshShadow.receiveShadow = true
    const floorObj = new Object3D()
    floorObj.name = 'floor'
    floorObj.add(floorMesh, floorMeshShadow)
    floorObj.rotateX(-Math.PI / 2)

    this.world
      .createEntity()
      .addObject3DComponent(floorObj, this.sceneEntity)

    this.world
      .createEntity()
      .addObject3DComponent(commonLights, this.sceneEntity)

    this.world
      .createEntity()
      .addObject3DComponent(sunContainer, this.sceneEntity)
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
