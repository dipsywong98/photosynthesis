import { Component, Types } from 'ecsy'
import { GrowthStage, TreeType } from '../../3d/constants'
import { Object3D } from 'three'

export default class TreeComponent extends Component<TreeComponent> {
  treeType!: TreeType
  growthStage!: GrowthStage
  topObj!: Object3D
  trunkObj!: Object3D
  shade!: Object3D
  previousTreeType!: TreeType | null
}

TreeComponent.schema = {
  treeType: { type: Types.String },
  growthStage: { type: Types.Number },
  topObj: { type: Types.Ref },
  trunkObj: { type: Types.Ref },
  shade: { type: Types.Ref },
  previousTreeType: { type: Types.String, default: null }
}
