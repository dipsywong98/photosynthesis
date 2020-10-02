import {
  CircleBufferGeometry,
  Mesh,
  MeshBasicMaterial,
  Object3D,
  PlaneBufferGeometry,
  TextureLoader
} from 'three'
import { IMAGES_LOCATION, SUN_SEGMENT_SIZE, TILE_SIZE } from './constants'

const textureLoader = new TextureLoader()

export const basicGray = new MeshBasicMaterial({
  color: 0xcccccc
})

const sunSegmentTexture = textureLoader.load(
  IMAGES_LOCATION + '/sun_segment.png', undefined, undefined, console.error
)
const sunSegmentMaterial = new MeshBasicMaterial({
  transparent: true,
  map: sunSegmentTexture
})
const sunSegmentGeometry = new PlaneBufferGeometry(SUN_SEGMENT_SIZE, SUN_SEGMENT_SIZE)
export const sunSegmentMesh = new Mesh(sunSegmentGeometry, sunSegmentMaterial)
sunSegmentMesh.rotation.x = -Math.PI / 2
sunSegmentMesh.renderOrder = 1

const leafCounts = [1, 2, 3, 4] as const
const leafImagePaths = leafCounts.map(count => `${IMAGES_LOCATION}/leaf_${count}.svg`)
const leafTextures = leafImagePaths.map(path => textureLoader.load(path))
const leafMaterials = leafTextures.map(texture => new MeshBasicMaterial({
  transparent: true,
  map: texture
}))
export const LEAF_CIRCLES = leafMaterials.map(leafMaterial => {
  const cylinderGeometry = new CircleBufferGeometry(TILE_SIZE / 3 * 2, 12)
  const leafMesh = new Mesh(cylinderGeometry, leafMaterial)
  leafMesh.rotation.x = -Math.PI / 2
  const leafObj = new Object3D()
  leafObj.name = 'cylinder'
  leafObj.add(leafMesh)
  return leafObj
})
