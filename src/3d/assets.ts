import { Object3D } from 'three'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader'
import { MODELS, MODELS_LOCATION } from './constants'

const loader = new GLTFLoader()

export const objects: Record<string, Object3D> = {}

const objectWaitOrders: Record<string, Array<(object: Object3D) => void> | undefined> = {}

export const startLoad = (): void => {
  Object.values(MODELS).forEach(name => {
    loader.load(MODELS_LOCATION + '/' + name + '.glb', (gltf) => {
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
      const waitOrders = objectWaitOrders[name]
      if (waitOrders !== undefined) {
        waitOrders.forEach(cb => {
          cb(object)
        })
      }
    })
  })
}

export const getObject = async (key: string): Promise<Object3D> => {
  if (objects[key] === undefined) {
    const queue = objectWaitOrders[key] ?? []
    if (objectWaitOrders[key] === undefined) {
      objectWaitOrders[key] = queue
    }
    return await new Promise<Object3D>((resolve) => {
      queue.push((object) => {
        resolve(object)
      })
    })
  } else {
    return Promise.resolve(objects[key])
  }
}
