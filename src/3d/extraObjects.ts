import { CylinderBufferGeometry, Mesh, MeshBasicMaterial, Object3D, PlaneBufferGeometry, TextureLoader } from 'three'
import { IMAGES_LOCATION, SUN_SEGMENT_SIZE } from './constants'

const cylinderGeometry = new CylinderBufferGeometry(4, 4, 1, 12)
const cylinderMaterial = new MeshBasicMaterial()
cylinderMaterial.visible = false
cylinderMaterial.name = 'invisible'
const cylinderMesh = new Mesh(cylinderGeometry, cylinderMaterial)
export const CYLINDER_OBJ = new Object3D()
CYLINDER_OBJ.name = 'cylinder'
CYLINDER_OBJ.add(cylinderMesh)

export const basicGray = new MeshBasicMaterial({
  color: 0xcccccc
})

const sunSegmentTexture = new TextureLoader().load(
  IMAGES_LOCATION + '/sun_segment.png', undefined, undefined, console.error
)
const sunSegmentMaterial = new MeshBasicMaterial({ transparent: true, map: sunSegmentTexture })
const sunSegmentGeometry = new PlaneBufferGeometry(SUN_SEGMENT_SIZE, SUN_SEGMENT_SIZE)
export const sunSegmentMesh = new Mesh(sunSegmentGeometry, sunSegmentMaterial)
sunSegmentMesh.rotation.x = -Math.PI / 2
