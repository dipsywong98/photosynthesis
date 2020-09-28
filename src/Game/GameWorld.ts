import { ECSYThreeEntity, ECSYThreeObject3D, ECSYThreeWorld, initialize, WebGLRendererSystem } from 'ecsy-three'
import {
  AmbientLight,
  Clock,
  DirectionalLight,
  Group,
  Mesh,
  MeshStandardMaterial,
  Object3D,
  PerspectiveCamera,
  sRGBEncoding,
  Vector2,
  Vector3,
  VSMShadowMap,
  WebGLRenderer
} from 'three'
import TreeSystem from './systems/TreeSystem'
import TweenSystem from './systems/TweenSystem'
import { disposeObj3D } from '../3d/helpers'
import TreeComponent from './components/TreeComponent'
import TweenComponent from './components/TweenComponent'
import AxialCoordsComponent from './components/AxialCoordsComponent'
import {
  AMBIENT_COLOR,
  INITIAL_SUN_ORIENTATION,
  MODELS,
  SKY_COLOR,
  SUN_ANGLE,
  SUN_COLOR,
  TREE_GROWTH_DURATION
} from '../3d/constants'
import { getObject } from '../3d/assets'
import TileComponent from './components/TileComponent'
import AxialCoordsSystem from './systems/AxialCoordsSystem'
import TileSystem from './systems/TileSystem'
import SunOrientationTagComponent from './components/SunOrientationTagComponent'
import SunOrientationSystem from './systems/SunOrientationSystem'
import dat from 'dat.gui'
import { Axial } from '../3d/Coordinates/Axial'
import { CYLINDER_OBJ } from '../3d/extraObjects'
import Stats from 'stats.js'
import { GameWorldMessages } from './GameWorldMessages'
import { TileInfo } from './types/TileInfo'
import TouchSystem from './systems/TouchSystem'
import { RendererComposerSystem } from './systems/RendererComposerSystem'
import RendererComposerComponent from './components/RendererComposerComponent'
import SelectableComponent from './components/SelectableComponent'
import SelectionSystem from './systems/SelectionSystem'
import { createTree } from './entities/tree'
import TweenObjectProperties from './types/TweenObjectProperties'
import { applyVector3 } from './easing/applyEasing'
import jelly from './easing/3d/jelly'

export default class GameWorld {
  gui: dat.GUI
  stats: Stats

  renderer: WebGLRenderer
  world: ECSYThreeWorld
  sceneEntity!: ECSYThreeEntity
  camera!: PerspectiveCamera
  messages: Record<string, unknown[]> = {}
  cameraTiltObj!: Object3D
  cameraRotationObj!: Object3D

  sunOrientationRad = 0
  hasStarted = false

  gameEntity!: ECSYThreeEntity
  tileEntities: Map<string, ECSYThreeEntity> = new Map<string, ECSYThreeEntity>()

  // ray casting selections
  mouseScreenPosition = new Vector2()
  hasMouseMoved = false
  activeObject?: Object3D & ECSYThreeObject3D
  hoverObject?: Object3D & ECSYThreeObject3D

  constructor () {
    this.stats = new Stats()
    this.gui = new dat.GUI()
    this.renderer = new WebGLRenderer({ antialias: true })
    this.world = new ECSYThreeWorld({ entityPoolSize: 1000 })
    document.body.appendChild(this.stats.dom)
    window.addEventListener('load', () => {
      this.init()
    })
  }

  public dispose (): void {
    this.destroyGUI()
    this.world.stop()
    this.tileEntities.clear()
    disposeObj3D(this.sceneEntity?.getObject3D())
    this.sunOrientationRad = 0
    this.hasStarted = false
    console.log('end')
  }

  public init (): void {
    if (this.hasStarted) return
    console.log('start')
    this.hasStarted = true

    this.initGUI()

    const clock = new Clock()
    const {
      camera,
      sceneEntity
    } = initialize(this.world, {
      renderer: this.renderer,
      animationLoop: () => {
        this.stats.begin()
        this.world.execute(clock.getDelta(), clock.elapsedTime)
        this.stats.end()
      }
    })
    this.camera = camera
    this.sceneEntity = sceneEntity

    this.initRenderer()
    this.initECS()
    this.initScene()
    this.world.play()
  }

  private destroyGUI (): void {
    this.gui.destroy()
    this.gui = new dat.GUI()
  }

  private initGUI (): void {
    // const sunControl = this.gui.add(this, 'sunOrientationRad', 0, 2 * Math.PI)
    // sunControl.name('Sun orientation')
    // sunControl.step(0.01)
  }

  private initECS (): void {
    this.world.registerComponent(TreeComponent)
    this.world.registerComponent(TweenComponent)
    this.world.registerComponent(AxialCoordsComponent)
    this.world.registerComponent(TileComponent)
    this.world.registerComponent(SunOrientationTagComponent)
    this.world.registerComponent(RendererComposerComponent)
    this.world.registerComponent(SelectableComponent)

    this.world.unregisterSystem(WebGLRendererSystem)
    this.world.registerSystem(RendererComposerSystem, { priority: 999, gameWorld: this })

    this.world.registerSystem(AxialCoordsSystem)
    this.world.registerSystem(TileSystem)
    this.world.registerSystem(TreeSystem, { gameWorld: this })
    this.world.registerSystem(TweenSystem)
    this.world.registerSystem(SunOrientationSystem, { gameWorld: this })
    this.world.registerSystem(SelectionSystem, { gameWorld: this })
    this.world.registerSystem(TouchSystem, { gameWorld: this })
  }

  private initRenderer (): void {
    this.renderer.shadowMap.enabled = true
    this.renderer.shadowMap.type = VSMShadowMap
    this.renderer.setClearColor(SKY_COLOR)
    this.renderer.outputEncoding = sRGBEncoding
  }

  private initScene (): void {
    this.camera.position.set(0, 0, 95)
    this.camera.fov = 40

    this.sceneEntity.getObject3D()?.remove(this.camera)

    const cameraTiltObj = new Object3D()
    cameraTiltObj.name = 'cameraTilt'
    cameraTiltObj.rotation.x = -0.4
    cameraTiltObj.add(this.camera)
    this.cameraTiltObj = cameraTiltObj

    const cameraRotationObj = new Object3D()
    cameraRotationObj.name = 'cameraRotation'
    cameraRotationObj.add(cameraTiltObj)
    this.cameraRotationObj = cameraRotationObj

    const cameraFolder = this.gui.addFolder('Camera')

    cameraFolder.add(this.camera.position, 'z', 20, 300, 1).name('zoom')
    // cameraFolder.add(cameraTiltObj.rotation, 'x', -Math.PI / 2, 0, 0.01).name('tilt')
    // cameraFolder.add(cameraRotationObj.rotation, 'y', 0, Math.PI * 2, 0.01).name('rotation')
    cameraFolder.open()

    this.world.createEntity()
      .addObject3DComponent(cameraRotationObj, this.sceneEntity)

    const ambientLight = new AmbientLight(AMBIENT_COLOR, 0.5)
    const sun = new DirectionalLight(SUN_COLOR, 1.2)
    sun.position.set(0, Math.sin(SUN_ANGLE) * 150, 150)
    sun.castShadow = true
    sun.shadow.camera.visible = true
    sun.shadow.bias = -0.001
    sun.shadow.radius = 2
    sun.shadow.camera.near = 50
    sun.shadow.camera.far = 300
    sun.shadow.camera.top = -100
    sun.shadow.camera.bottom = 50
    sun.shadow.camera.left = -100
    sun.shadow.camera.right = 100
    sun.shadow.mapSize.set(2 ** 9, 2 ** 9)
    const sunContainer = new Group()
    sunContainer.name = 'sun'
    sunContainer.add(sun)

    const sky = new DirectionalLight(0xFFFFFF, 0.2)
    sky.name = 'sky'
    sky.position.y = 100
    // sky.castShadow = true
    // sky.shadow.bias = -0.001
    // sky.shadow.radius = 128
    // sky.shadow.camera.near = 10
    // sky.shadow.camera.far = 150
    // sky.shadow.camera.top = -30
    // sky.shadow.camera.bottom = 30
    // sky.shadow.camera.left = -30
    // sky.shadow.camera.right = 30
    // sky.shadow.mapSize.set(2 ** 13, 2 ** 13)

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
      .addComponent(SunOrientationTagComponent)

    const game = new Group()
    game.name = 'Game'

    this.gameEntity = this.world
      .createEntity()
      .addObject3DComponent(game, this.sceneEntity)

    this.generateGrid()
  }

  private generateGrid (): void {
    const boardObj = new Object3D()
    boardObj.name = 'gameBoard'

    const boardEntity = this.world
      .createEntity()
      .addObject3DComponent(boardObj, this.gameEntity)

    Axial.origin.range(3).forEach(axial => {
      const tileContainer = new Group()
      tileContainer.name = 'tileContainer-' + axial.toString()
      const tileEntity = this.world
        .createEntity()
        .addObject3DComponent(tileContainer, boardEntity)
        .addComponent(AxialCoordsComponent, { axial })
        .addComponent(TileComponent)
      tileEntity
        .addComponent(SelectableComponent, { refEntity: tileEntity })
      this.tileEntities.set(axial.toString(), tileEntity)
    })

    getObject(MODELS.RING)
      .then(ring => {
        this.tileEntities.forEach(entity => {
          const ringContainerObj = new Object3D()
          ringContainerObj.name = 'ringContainer'
          const ringClone = ring.clone()
          const mesh = ringClone.children.find((o): o is Mesh => o instanceof Mesh)
          // Assuming material exists and is a MeshStandardMaterial
          const originalMaterial = mesh?.material
          const axialComp = entity.getComponent(AxialCoordsComponent)
          if (mesh !== undefined && originalMaterial instanceof MeshStandardMaterial && axialComp !== undefined) {
            const material = originalMaterial.clone()
            mesh.material = material
            mesh.material.name = 'tileRing-' + axialComp.axial.toString()
            const tileComp = entity.getMutableComponent(TileComponent)
            if (tileComp !== undefined) {
              tileComp.material = material
            }
          } else {
            console.error('Cannot find standard material inside ring object')
          }
          ringContainerObj.add(ringClone, CYLINDER_OBJ.clone())
          entity.getObject3D()?.add(ringContainerObj)
        })
      })
      .catch(console.error)
  }

  /**
   * Send and receive messages between main game logic and ECS
   * @param target Recipient
   * @param message Message to recipient
   */
  public send (target: GameWorldMessages, message: unknown): void {
    const queue = this.messages[target] ?? []

    if (this.messages[target] === undefined) {
      this.messages[target] = queue
    }

    queue.push(message)
  }

  /**
   * Set the display at the tile, may
   * remove it if color or growStage is undefined
   * create a new tree if that location dont have tree
   * grow the tree if that location have tree
   * @param axial
   * @param color
   * @param growthStage
   */
  public setTile (axial: Axial, { color, growthStage }: Partial<TileInfo> = {}): void {
    const treeEntity = this.tileEntities.get(axial.toString())?.getComponent(TileComponent)?.treeEntity
    const treeComponent = treeEntity?.getMutableComponent(TreeComponent)
    if (treeComponent !== undefined) {
      if (growthStage !== undefined) {
        treeComponent.growthStage = growthStage
      } else if (treeEntity !== undefined) {
        this.removeTree(axial)
      }
    } else {
      if (color !== undefined && growthStage !== undefined) {
        createTree(this, { color, growthStage, axial })
      }
    }
  }

  public setRayDirection (directionType: number): void {
    this.sunOrientationRad = INITIAL_SUN_ORIENTATION + directionType * Math.PI / 3
  }

  public getActiveEntity (): ECSYThreeEntity | undefined {
    return this.activeObject?.entity?.getComponent(SelectableComponent)?.refEntity
  }

  public getActiveAxial (): Axial | undefined {
    return this.getActiveEntity()?.getComponent(AxialCoordsComponent)?.axial
  }

  private removeTree (axial: Axial): void {
    // animate tree removal
    const linkedTileComponent = this.tileEntities.get(axial.toString())?.getMutableComponent(TileComponent)
    const treeEntity = linkedTileComponent?.treeEntity
    treeEntity?.getComponent<TweenComponent<TweenObjectProperties<Object3D, 'scale'>>>(TweenComponent)?.tweens?.push({
      duration: TREE_GROWTH_DURATION,
      from: new Vector3(1, 1, 1),
      func: applyVector3(jelly),
      loop: 1,
      prop: 'scale',
      to: new Vector3(0, 0, 0),
      value: 0
    })
    setTimeout(() => {
      treeEntity?.remove()
      if (linkedTileComponent !== undefined) {
        linkedTileComponent.treeEntity = undefined
      }
    }, TREE_GROWTH_DURATION)
  }
}
