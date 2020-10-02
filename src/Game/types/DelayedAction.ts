import { Entity } from 'ecsy'

export default interface DelayedAction {
  handler: (entity: Entity) => void
  timeout: number
}
