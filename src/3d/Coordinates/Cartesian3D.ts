import Coordinates from './Coordinates'

export default class Cartesian3D implements Coordinates<Cartesian3D> {
  public x: number
  public y: number
  public z: number

  constructor (x: number, y: number, z: number) {
    this.x = x
    this.y = y
    this.z = z
  }

  public static fromArray (a: [number, number, number]): Cartesian3D {
    return new Cartesian3D(...a)
  }

  public static fromString (s: string): Cartesian3D {
    const a = s.split(',').map((i: string) => parseInt(i, 10))
    return Cartesian3D.fromArray([a[0], a[1], a[2]])
  }

  public static get origin (): Cartesian3D {
    return new Cartesian3D(0, 0, 0)
  }

  public get asArray (): [number, number, number] {
    return [this.x, this.y, this.z]
  }

  public get asString (): string {
    return this.asArray.join(',')
  }

  public add (coords: Cartesian3D): Cartesian3D {
    this.x += coords.x
    this.y += coords.y
    this.z += coords.z
    return this
  }

  public scale (n: number): Cartesian3D {
    this.x *= n
    this.y *= n
    this.z *= n
    return this
  }
}
