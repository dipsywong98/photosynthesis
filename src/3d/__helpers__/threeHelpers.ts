import { Group, LoadingManager, Material, Object3D, Texture } from 'three'
import { GLTF, GLTFParser, GLTFReference } from 'three/examples/jsm/loaders/GLTFLoader'

export const mockManager: jest.Mocked<LoadingManager> = {
  onError: jest.fn(),
  onLoad: jest.fn(),
  onProgress: jest.fn(),
  addHandler: jest.fn(),
  getHandler: jest.fn(),
  itemEnd: jest.fn(),
  itemError: jest.fn(),
  itemStart: jest.fn(),
  removeHandler: jest.fn(),
  resolveURL: jest.fn(),
  setURLModifier: jest.fn()
}

export const gltfParser: GLTFParser = {
  associations: new Map<Object3D | Material | Texture, GLTFReference>(),
  getDependencies: jest.fn(),
  getDependency: jest.fn(),
  json: undefined
}

export const createMockGltf = (): GLTF => {
  const scene = new Group()
  scene.add(new Object3D())

  return {
    animations: [],
    asset: {},
    cameras: [],
    parser: gltfParser,
    scene,
    scenes: [],
    userData: undefined
  }
}
