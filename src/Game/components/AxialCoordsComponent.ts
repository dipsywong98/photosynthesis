import { Component, Types } from 'ecsy'
import Axial from '../../3d/Coordinates/Axial'

export default class AxialCoordsComponent extends Component<AxialCoordsComponent> {
  position!: Axial
}

AxialCoordsComponent.schema = {
  position: { type: Types.Ref }
}
