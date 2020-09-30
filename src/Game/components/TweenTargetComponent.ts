import { Component, Types } from 'ecsy'

export default class TweenTargetComponent<T> extends Component<TweenTargetComponent<T>> {
  ref!: T
}

TweenTargetComponent.schema = {
  ref: { type: Types.Ref }
}
