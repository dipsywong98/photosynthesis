import { Component, Types } from 'ecsy'
import { ECSYThreeEntity } from 'ecsy-three'

export default class SelectableComponent extends Component<SelectableComponent> {
  refEntity!: ECSYThreeEntity
}

SelectableComponent.schema = {
  refEntity: { type: Types.Ref }
}
