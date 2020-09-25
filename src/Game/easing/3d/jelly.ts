import { Vector3 } from 'three'
import { compose } from 'ramda'
import inverseElastic from '../1d/inverseElastic'
import elastic from '../1d/elastic'
import easeOut from '../1d/easeOut'

const hEase = compose(inverseElastic, easeOut)
const vEase = compose(elastic, easeOut)

export default (i: number): Vector3 => {
  const xz = hEase(i)
  return new Vector3(xz, vEase(i), xz)
}
