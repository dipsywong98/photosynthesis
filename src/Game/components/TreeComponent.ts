import { Component, Types } from 'ecsy'
import { Color, GrowthStage } from '../../3d/constants'
import { Object3D } from 'three'
import { disposeObj3D } from '../../3d/helpers'

export default class TreeComponent extends Component<TreeComponent> {
  readonly color!: Color
  growthStage!: GrowthStage
  seedObj!: Object3D | null
  treeObj!: Object3D | null
  topObj!: Object3D | null
  trunkObj!: Object3D | null
  shadeObj!: Object3D | null

  reset (): void {
    disposeObj3D(this.topObj)
    disposeObj3D(this.trunkObj)
    disposeObj3D(this.treeObj)
    disposeObj3D(this.seedObj)
    this.seedObj = null
    this.treeObj = null
    this.topObj = null
    this.trunkObj = null
  }
}

TreeComponent.schema = {
  color: { type: Types.Number },
  growthStage: { type: Types.Number },
  treeObj: { type: Types.Ref, default: null },
  topObj: { type: Types.Ref, default: null },
  trunkObj: { type: Types.Ref, default: null },
  shadeObj: { type: Types.Ref, default: null },
  seedObj: { type: Types.Ref, default: null }
}
