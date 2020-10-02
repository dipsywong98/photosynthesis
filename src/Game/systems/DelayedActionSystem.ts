import { System } from 'ecsy'
import DelayedActionComponent from '../components/DelayedActionComponent'
import DelayedAction from '../types/DelayedAction'

export default class DelayedActionSystem extends System {
  execute (delta: number, time: number): void {
    this.queries.delayedActions.results.forEach(entity => {
      const delayedActionComp = entity.getMutableComponent(DelayedActionComponent)

      if (delayedActionComp !== undefined) {
        const newActions: DelayedAction[] = []

        delayedActionComp.actions.forEach(delayedAction => {
          delayedAction.timeout = Math.max(0, delayedAction.timeout - delta)
          if (delayedAction.timeout === 0) {
            delayedAction.handler(entity)
          } else {
            newActions.push(delayedAction)
          }
        })

        delayedActionComp.actions = newActions
      }
    })
  }
}

DelayedActionSystem.queries = {
  delayedActions: {
    components: [DelayedActionComponent]
  }
}
