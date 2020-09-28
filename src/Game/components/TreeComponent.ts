import { Component, Types } from 'ecsy'
import { Color, GrowthStage } from '../../3d/constants'
import { Object3D } from 'three'
import { disposeObj3D } from '../../3d/helpers'
import { ECSYThreeEntity } from 'ecsy-three'

export default class TreeComponent extends Component<TreeComponent> {
  readonly color!: Color
  growthStage!: GrowthStage
  topObj?: Object3D
  trunkObj?: Object3D
  plant?: ECSYThreeEntity
  seed?: ECSYThreeEntity
  tree?: ECSYThreeEntity
  shade?: ECSYThreeEntity
  groundShade?: ECSYThreeEntity

  reset (): void {
    this.plant = undefined
    this.seed = undefined
    this.tree = undefined
    this.shade = undefined
    disposeObj3D(this.topObj)
    disposeObj3D(this.trunkObj)
    this.topObj = undefined
    this.trunkObj = undefined
  }
}

TreeComponent.schema = {
  color: { type: Types.Number },
  growthStage: { type: Types.Number },
  tree: { type: Types.Ref, default: undefined },
  topObj: { type: Types.Ref, default: undefined },
  trunkObj: { type: Types.Ref, default: undefined },
  shade: { type: Types.Ref, default: undefined },
  seed: { type: Types.Ref, default: undefined }
}
