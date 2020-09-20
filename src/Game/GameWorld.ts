import { ECSYThreeEntity, ECSYThreeWorld, initialize, Object3DComponent } from 'ecsy-three'
import {
  AmbientLight,
  DirectionalLight,
  Group,
  Mesh,
  MeshStandardMaterial,
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
import { AMBIENT_COLOR, Color, GrowthStage, MODELS, SKY_COLOR, SUN_ANGLE, SUN_COLOR } from '../3d/constants'
import { getObject } from '../3d/assets'
import HexCube from '../3d/Coordinates/HexCube'
import TileComponent from './components/TileComponent'
import AxialCoordsSystem from './systems/AxialCoordsSystem'
import TileSystem from './systems/TileSystem'
import SunOrientationComponent from './components/SunOrientationComponent'
import SunOrientationSystem from './systems/SunOrientationSystem'
import { createTree } from './entities/tree'
import dat from 'dat.gui'
import { Axial } from '../3d/Coordinates/Axial'
import { CYLINDER_OBJ } from '../3d/extraObjects'

export default class GameWorld {
  gui: dat.GUI

  renderer: WebGLRenderer
  world: ECSYThreeWorld
  sceneEntity?: ECSYThreeEntity
  camera?: PerspectiveCamera
  messages: Record<string, unknown[]> = {}

  sunOrientationRad = 0
  started = false

  tileEntities: Map<string, ECSYThreeEntity> = new Map<string, ECSYThreeEntity>()

  constructor () {
    this.gui = new dat.GUI()
    this.renderer = new WebGLRenderer()
    this.world = new ECSYThreeWorld()
    window.addEventListener('load', () => {
      this.init()
    })
  }

  public dispose (): void {
    this.resetGUI()
    this.world.stop()
    this.tileEntities.clear()
    disposeObj3D(this.sceneEntity?.getComponent(Object3DComponent)?.value)
    this.sunOrientationRad = 0
    this.started = false
    console.log('end')
  }

  public init (): void {
    if (this.started) return
    console.log('start')
    this.started = true
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

  public resetWorld (): void {
    this.dispose()
    this.init()
  }

  private resetGUI (): void {
    this.gui.destroy()
    this.gui = new dat.GUI()

    const sunControl = this.gui.add(this, 'sunOrientationRad', 0, 2 * Math.PI)
    sunControl.name('Sun orientation')
    sunControl.step(0.01)
  }

  private initECS (): void {
    this.world.registerComponent(TreeComponent)
    this.world.registerComponent(TweenBaseComponent)
    this.world.registerComponent(TweenObject3DComponent)
    this.world.registerComponent(TweenMaterialComponent)
    this.world.registerComponent(AxialCoordsComponent)
    this.world.registerComponent(TileComponent)
    this.world.registerComponent(SunOrientationComponent)

    this.world.registerSystem(AxialCoordsSystem)
    this.world.registerSystem(TileSystem)
    this.world.registerSystem(TreeSystem, { gameWorld: this })
    this.world.registerSystem(TweenSystem)
    this.world.registerSystem(SunOrientationSystem, { gameWorld: this })
  }

  private initRenderer (): void {
    this.renderer.shadowMap.enabled = true
    this.renderer.shadowMap.type = VSMShadowMap
    this.renderer.setClearColor(SKY_COLOR)
    this.renderer.outputEncoding = sRGBEncoding
  }

  private initScene (): void {
    if (this.camera !== undefined && this.sceneEntity !== undefined) {
      this.camera.position.set(0, 0, 150)
      this.camera.fov = 40

      this.sceneEntity.getObject3D()?.remove(this.camera)

      const cameraTiltObj = new Object3D()
      cameraTiltObj.name = 'cameraTilt'
      cameraTiltObj.rotation.x = -0.4
      cameraTiltObj.add(this.camera)

      const cameraPivotObj = new Object3D()
      cameraPivotObj.name = 'cameraPivot'
      cameraPivotObj.add(cameraTiltObj)

      const cameraFolder = this.gui.addFolder('Camera')

      cameraFolder.add(this.camera.position, 'z', 20, 300, 1).name('zoom')
      cameraFolder.add(cameraTiltObj.rotation, 'x', -Math.PI / 2, 0, 0.01).name('tilt')
      cameraFolder.add(cameraPivotObj.rotation, 'y', 0, Math.PI * 2, 0.01).name('rotation')
      cameraFolder.open()

      this.world.createEntity()
        .addObject3DComponent(cameraPivotObj, this.sceneEntity)
    }

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
    sun.shadow.mapSize.set(2 ** 11, 2 ** 10)
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
      .addComponent(SunOrientationComponent)

    this.generateGrid()

    createTree(this, { color: Color.YELLOW, growthStage: GrowthStage.MID, axial: new Axial(0, 1) })
  }

  private generateGrid (): void {
    const boardObj = new Object3D()
    boardObj.name = 'gameBoard'

    const boardEntity = this.world
      .createEntity()
      .addObject3DComponent(boardObj, this.sceneEntity)

    new HexCube(0, 0, 0).range(3).forEach(hexCube => {
      const axial = hexCube.toAxial()
      const tileContainer = new Group()
      tileContainer.name = 'tileContainer-' + axial.toString()
      console.log(tileContainer.name)
      const tileEntity = this.world
        .createEntity()
        .addObject3DComponent(tileContainer, boardEntity)
        .addComponent(AxialCoordsComponent, { axial })
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
            entity.addComponent(TileComponent, { material })
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
  public send (target: string, message: unknown): void {
    const queue = this.messages[target] ?? []

    if (this.messages[target] === undefined) {
      this.messages[target] = queue
    }

    queue.push(message)
  }
}
