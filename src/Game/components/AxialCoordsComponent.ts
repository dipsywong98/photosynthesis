import { Component, Types } from 'ecsy'
import Axial from '../../3d/Coordinates/Axial'

export default class AxialCoordsComponent extends Component<AxialCoordsComponent> {
  axial!: Axial
}

AxialCoordsComponent.schema = {
  axial: { type: Types.Ref }
}
