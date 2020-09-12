import { Object3D } from 'three'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader'
import { MODELS, MODELS_LOCATION } from './constants'

export const objects: Record<string, Object3D | undefined> = {}

const objectWaitOrders: Record<string, Array<{
  resolve: (value?: Object3D | PromiseLike<Object3D>) => void
  reject: (reason?: unknown) => void
  modelName: string
}> | undefined> = {}

let loadedCount = 0
let totalCount = 0

export const resetAssets = (): void => {
  Object.keys(objects).forEach(key => {
    objects[key] = undefined
  })
  loadedCount = 0
  totalCount = 0
}

const modelNotFoundMessage = 'Model not found'

const doneLoading = (): void => {
  // Clean up unhandled promises
  Object.values(objectWaitOrders)
    .filter(orders => Array.isArray(orders))
    .forEach(orders => orders?.forEach(({ reject, modelName }) => reject(new Error(modelNotFoundMessage + ': ' + modelName))))
  Object.keys(objectWaitOrders).forEach(key => {
    objectWaitOrders[key] = undefined
  })
}

export const startLoad = (): void => {
  const loader = new GLTFLoader()
  const modelNames = Object.values(MODELS)
  totalCount = modelNames.length
  modelNames.forEach(name => {
    loader.load(
      MODELS_LOCATION + '/' + name + '.glb',
      (gltf) => {
        // Process objects
        const object = new Object3D()
        object.castShadow = true
        object.receiveShadow = true
        object.name = name
        object.add(...gltf.scene.children)
        object.traverse(child => {
          child.castShadow = true
          child.receiveShadow = true
        })
        objects[name] = object

        // Resolve promises
        const waitOrders = objectWaitOrders[name]
        if (waitOrders !== undefined) {
          waitOrders.forEach(order => {
            order.resolve(object)
          })
          objectWaitOrders[name] = undefined
        }

        // Loaded
        loadedCount++
        if (loadedCount === totalCount) {
          doneLoading()
        }
      },
      undefined,
      (e) => console.error(e)
    )
  })
}

export const getObject = async (modelName: string): Promise<Object3D> => {
  const obj3d = objects[modelName]
  if (obj3d === undefined) {
    if (loadedCount !== totalCount) {
      // Not all models are loaded, this model may be loading
      const queue = objectWaitOrders[modelName] ?? []
      if (objectWaitOrders[modelName] === undefined) {
        objectWaitOrders[modelName] = queue
      }
      return await new Promise<Object3D>((resolve, reject) => {
        queue.push({ resolve, reject, modelName })
      })
    } else {
      // Model name is definitely not loaded
      return Promise.reject(new Error(modelNotFoundMessage + ': ' + modelName))
    }
  } else {
    return Promise.resolve(obj3d)
  }
}
