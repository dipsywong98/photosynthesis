import { Component, Entity } from 'ecsy'
import DelayedAction from '../types/DelayedAction'

export default class DelayedActionComponent extends Component<DelayedActionComponent> {
  actions: DelayedAction[] = []

  static setTimeout (entity: Entity, handler: DelayedAction['handler'], timeout: number): void {
    entity.getComponent(DelayedActionComponent)?.actions.push({
      handler,
      timeout
    })
  }
}

DelayedActionComponent.schema = {
}
