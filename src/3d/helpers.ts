import { Material, Mesh, Object3D, Texture } from 'three'
import { BufferGeometry } from 'three/src/core/BufferGeometry'
import { basicGray } from './extraObjects'

export const disposeObj3D = (obj3d?: Object3D | null): void => {
  obj3d?.traverse((obj) => {
    if (obj instanceof Mesh) {
      const geometry = obj.geometry as BufferGeometry | undefined
      const material = obj.material as Material | Material[] | undefined

      if (geometry !== undefined) {
        geometry.dispose()
      }

      const disposeMaterial = (material: Material): void => {
        Object.keys(material).forEach((key) => {
          const prop = material[key as keyof Material] as unknown
          if (prop instanceof Texture) {
            prop.dispose()
          }
        })
        material.dispose()
      }

      if (material !== undefined) {
        // Assuming no texture is used
        if (Array.isArray(material)) {
          material.forEach(disposeMaterial)
        } else {
          disposeMaterial(material)
        }
      }
    }
  })
}

export const swapMaterial = (child: Object3D): void => {
  if (child instanceof Mesh) {
    child.material = basicGray
  }
}
