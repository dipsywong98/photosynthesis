import { Component, Types } from 'ecsy'
import { GrowthStage, Color } from '../../3d/constants'
import { Object3D } from 'three'

export default class TreeComponent extends Component<TreeComponent> {
  color!: Color
  growthStage!: GrowthStage
  topObj!: Object3D
  trunkObj!: Object3D
  shade!: Object3D
  previousTreeType!: Color | null
}

TreeComponent.schema = {
  color: { type: Types.Number },
  growthStage: { type: Types.Number },
  topObj: { type: Types.Ref },
  trunkObj: { type: Types.Ref },
  shade: { type: Types.Ref },
  previousTreeType: { type: Types.Number, default: null }
}
