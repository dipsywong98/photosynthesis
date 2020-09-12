import Coordinates from './Coordinates'

export default class Cartesian2D implements Coordinates<Cartesian2D> {
  public x: number
  public y: number

  constructor (x: number, y: number) {
    this.x = x
    this.y = y
  }

  public static fromArray (a: [number, number]): Cartesian2D {
    return new Cartesian2D(...a)
  }

  public static fromString (s: string): Cartesian2D {
    const a = s.split(',').map((i: string) => parseInt(i, 10))
    return Cartesian2D.fromArray([a[0], a[1]])
  }

  public static neighbors: Cartesian2D[] = [
    new Cartesian2D(-1, -1),
    new Cartesian2D(0, -1),
    new Cartesian2D(1, -1),
    new Cartesian2D(-1, 0),
    new Cartesian2D(1, 0),
    new Cartesian2D(-1, 1),
    new Cartesian2D(0, 1),
    new Cartesian2D(1, 1)
  ]

  public static get origin (): Cartesian2D {
    return new Cartesian2D(0, 0)
  }

  public toArray (): [number, number] {
    return [this.x, this.y]
  }

  public toString (): string {
    return this.toArray().join(',')
  }

  public add (coords: Cartesian2D): Cartesian2D {
    this.x += coords.x
    this.y += coords.y
    return this
  }

  public scale (n: number): Cartesian2D {
    this.x *= n
    this.y *= n
    return this
  }

  public euclideanDistance (t: Cartesian2D): number {
    return Math.sqrt((this.x - t.x) ** 2 + (this.y - t.y) ** 2)
  }

  public manhattanDistance (t: Cartesian2D): number {
    return this.x - t.x + (this.y - t.y)
  }

  public added (coord: Cartesian2D): Cartesian2D {
    const ret = new Cartesian2D(this.x, this.y)
    return ret.add(coord)
  }

  public scaled (n: number): Cartesian2D {
    const ret = new Cartesian2D(this.x, this.y)
    return ret.scale(n)
  }

  public norm (): number {
    return this.euclideanDistance(Cartesian2D.origin)
  }

  public normalize (): Cartesian2D {
    return this.scale(1 / this.norm())
  }

  public normalized (): Cartesian2D {
    const ret = new Cartesian2D(this.x, this.y)
    return ret.normalize()
  }

  public clone (): Cartesian2D {
    return new Cartesian2D(this.x, this.y)
  }
}
