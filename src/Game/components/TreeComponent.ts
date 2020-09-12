import { Component, Entity, Types } from 'ecsy'
import { Color, GrowthStage } from '../../3d/constants'
import { Object3D } from 'three'
import { disposeObj3D } from '../../3d/helpers'

export default class TreeComponent extends Component<TreeComponent> {
  readonly color!: Color
  growthStage!: GrowthStage
  seedObj?: Object3D
  treeObj?: Object3D
  topObj?: Object3D
  trunkObj?: Object3D
  shadeObj?: Object3D
  shadeEntity?: Entity

  reset (): void {
    disposeObj3D(this.topObj)
    disposeObj3D(this.trunkObj)
    disposeObj3D(this.treeObj)
    disposeObj3D(this.seedObj)
    this.seedObj = undefined
    this.treeObj = undefined
    this.topObj = undefined
    this.trunkObj = undefined
  }
}

TreeComponent.schema = {
  color: { type: Types.Number },
  growthStage: { type: Types.Number },
  treeObj: { type: Types.Ref, default: undefined },
  topObj: { type: Types.Ref, default: undefined },
  trunkObj: { type: Types.Ref, default: undefined },
  shadeObj: { type: Types.Ref, default: undefined },
  shadeEntity: { type: Types.Ref, default: undefined },
  seedObj: { type: Types.Ref, default: undefined }
}
