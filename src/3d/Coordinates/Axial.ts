import HexCube from './HexCube'
import Coordinates from './Coordinates'
import Cartesian2D from './Cartesian2D'

export default class Axial implements Coordinates<Axial> {
  public q: number
  public r: number

  constructor (q: number, r: number) {
    this.q = q
    this.r = r
  }

  public static neighbors = [
    new Axial(+1, 0),
    new Axial(+1, -1),
    new Axial(0, -1),
    new Axial(-1, 0),
    new Axial(-1, +1),
    new Axial(0, +1)
  ]

  public static fromArray (a: [number, number]): Axial {
    return new Axial(...a)
  }

  public static fromString (s: string): Axial {
    const a = s.split(',').map((i: string) => parseInt(i, 10))
    return Axial.fromArray([a[0], a[1]])
  }

  static get origin (): Axial {
    return new Axial(0, 0)
  }

  public toArray (): [number, number] {
    return [this.q, this.r]
  }

  public toString (): string {
    return this.toArray().join(',')
  }

  public toHexCube (): HexCube {
    return new HexCube(this.q, -this.q - this.r, this.r)
  }

  public toCartesian (size: number): Cartesian2D {
    const x = size * (Math.sqrt(3) * this.q + (Math.sqrt(3) / 2) * this.r)
    const y = size * ((3 / 2) * this.r)
    return new Cartesian2D(x, y)
  }

  public add (axial: Axial): Axial {
    this.q += axial.q
    this.r += axial.r
    return this
  }

  public scale (n: number): Axial {
    this.q *= n
    this.r *= n
    return this
  }

  public tileDistance (t: Axial): number {
    return (
      (Math.abs(this.q - t.q) +
        Math.abs(this.q + this.r - t.q - t.r) +
        Math.abs(this.r - t.r)) /
      2
    )
  }

  public range (r: number): Axial[] {
    return this.toHexCube().range(r).map((c) => c.toAxial())
  }
}

export { Axial }
