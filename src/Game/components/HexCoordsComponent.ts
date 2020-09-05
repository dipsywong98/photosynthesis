import { Component, Types } from 'ecsy'

export default class HexCoordsComponent extends Component<HexCoordsComponent> {
  x!: number
  y!: number
  z!: number
}

HexCoordsComponent.schema = {
  x: { type: Types.Number },
  y: { type: Types.Number },
  z: { type: Types.Number }
}
