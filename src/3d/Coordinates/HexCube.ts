import Axial from './Axial'
import Coordinates from './Coordinates'

export default class HexCube implements Coordinates<HexCube> {
  public x: number
  public y: number
  public z: number

  constructor (x: number, y: number, z: number) {
    this.x = x
    this.y = y
    this.z = z
  }

  public static neighbors: HexCube[] = [
    new HexCube(+1, -1, 0), new HexCube(+1, 0, -1), new HexCube(0, +1, -1),
    new HexCube(-1, +1, 0), new HexCube(-1, 0, +1), new HexCube(0, -1, +1)
  ]

  public static fromArray (a: [number, number, number]): HexCube {
    return new HexCube(...a)
  }

  public static fromString (s: string): HexCube {
    const a = s.split(',').map((i: string) => parseInt(i, 10))
    return HexCube.fromArray([a[0], a[1], a[2]])
  }

  public static get origin (): HexCube {
    return new HexCube(0, 0, 0)
  }

  public toArray (): [number, number, number] {
    return [this.x, this.y, this.z]
  }

  public toString (): string {
    return this.toArray().join(',')
  }

  public toAxial (): Axial {
    return new Axial(this.x, this.z)
  }

  public add (hexCube: HexCube): HexCube {
    this.x += hexCube.x
    this.y += hexCube.y
    this.z += hexCube.z
    return this
  }

  public scale (n: number): HexCube {
    this.x *= n
    this.y *= n
    this.z *= n
    return this
  }

  public tileDistance (t: HexCube): number {
    return (Math.abs(this.x - t.x) + Math.abs(this.y - t.y) + Math.abs(this.z - t.z)) / 2
  }

  public range (r: number): HexCube[] {
    const results: HexCube[] = []
    for (let x = -r; x <= r; x++) {
      for (let y = Math.max(-r, -x - r); y <= Math.min(r, -x + r); y++) {
        const z = -x - y
        results.push(
          new HexCube(this.x + x, this.y + y, this.z + z)
        )
      }
    }
    return results
  }
}
