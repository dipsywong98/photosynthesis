import { getObject, objects, resetAssets, startLoad } from './assets'
import GLTFLoaderUtils, { GLTF } from 'three/examples/jsm/loaders/GLTFLoader'
import { Object3D } from 'three'
import { createMockGltf, mockManager } from './__helpers__/threeHelpers'

jest.mock('three/examples/jsm/loaders/GLTFLoader', () => ({
  GLTFLoader: jest.fn()
}))

jest.mock('./constants', () => ({
  MODELS_LOCATION: 'location',
  MODELS: {
    X: 'x',
    Y: 'y'
  }
}))

describe('Assets test', () => {
  const mockLoad = jest.fn()

  const mockGLTFLoader: jest.Mocked<GLTFLoaderUtils.GLTFLoader> = {
    crossOrigin: '',
    path: '',
    requestHeader: {},
    resourcePath: '',
    loadAsync: jest.fn(),
    setCrossOrigin: jest.fn(),
    setPath: jest.fn(),
    setRequestHeader: jest.fn(),
    setResourcePath: jest.fn(),
    ddsLoader: null,
    dracoLoader: null,
    manager: mockManager,
    load: mockLoad,
    setDRACOLoader: jest.fn(),
    setDDSLoader: jest.fn(),
    parse: jest.fn()
  }

  const mockGLTFLoaderUtils = GLTFLoaderUtils as jest.Mocked<typeof GLTFLoaderUtils>

  const errorSpy = jest.spyOn(console, 'error')

  mockGLTFLoaderUtils.GLTFLoader.mockImplementation(() => mockGLTFLoader)

  beforeEach(() => {
    // Reset loading states
    errorSpy.mockReset()
    resetAssets()
    mockLoad.mockReset()
  })

  it('All described models are loaded properly', () => {
    mockLoad.mockImplementation((_: string, cb: (gltf: GLTF) => void): void => {
      cb(createMockGltf())
    })

    startLoad()

    expect(mockLoad).toHaveBeenCalledWith('location/x.glb', expect.any(Function))
    expect(mockLoad).toHaveBeenCalledWith('location/y.glb', expect.any(Function))
    expect(objects).toEqual({
      x: expect.any(Object3D) as Object3D,
      y: expect.any(Object3D) as Object3D
    })
    expect(errorSpy).toHaveBeenCalledTimes(0)
  })

  it('getObject if model exists should resolve object', () => {
    objects.x = new Object3D()

    expect(getObject('x')).resolves.toEqual(objects.x).catch(e => { throw e })
    expect(errorSpy).toHaveBeenCalledTimes(0)
  })

  it('getObject if model not exists should reject Error', () => {
    expect(getObject('x')).rejects.toEqual(new Error('Model not found')).catch(e => { throw e })
  })

  it('getObject when model is still loading should wait to resolve object', () => {
    const callbacks: Array<(gltf: GLTF) => void> = []

    mockLoad.mockImplementation((_: string, cb: (gltf: GLTF) => void): void => {
      callbacks.push(cb)
    })

    startLoad()

    const promise = getObject('x')
    const promise2 = getObject('x')

    callbacks.forEach(cb => cb(createMockGltf()))

    expect(promise).resolves.toBeInstanceOf(Object3D).catch(e => { throw e })
    expect(promise2).resolves.toBeInstanceOf(Object3D).catch(e => { throw e })
    expect(errorSpy).toHaveBeenCalledTimes(0)
  })

  it('getObject when model will not be loaded in loading process should wait to reject Error', () => {
    const callbacks: Array<(gltf: GLTF) => void> = []

    mockLoad.mockImplementation((_: string, cb: (gltf: GLTF) => void): void => {
      callbacks.push(cb)
    })

    startLoad()

    const promise = getObject('z')

    callbacks.forEach(cb => cb(createMockGltf()))

    expect(promise).rejects.toEqual(new Error('Model not found')).catch(e => { throw e })
    expect(errorSpy).toHaveBeenCalledTimes(0)
  })
})
