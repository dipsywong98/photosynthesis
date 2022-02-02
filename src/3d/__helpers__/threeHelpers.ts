import { Group, LoadingManager, Object3D } from 'three'
import { GLTF, GLTFParser } from 'three/examples/jsm/loaders/GLTFLoader'

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

export const createMockGltf = (): GLTF => {
  const scene = new Group()
  scene.add(new Object3D())

  return {
    animations: [],
    asset: {},
    cameras: [],
    parser: {} as unknown as GLTFParser,
    scene,
    scenes: [],
    userData: undefined
  }
}
