import { Component, Types } from 'ecsy'
import { MeshStandardMaterial } from 'three'
import { ECSYThreeEntity } from 'ecsy-three'

export default class TileComponent extends Component<TileComponent> {
  material!: MeshStandardMaterial
  treeEntity?: ECSYThreeEntity
}

TileComponent.schema = {
  material: { type: Types.Ref },
  treeEntity: { type: Types.Ref, default: undefined }
}
