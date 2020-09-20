import { CylinderBufferGeometry, Mesh, MeshBasicMaterial, Object3D } from 'three'

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
