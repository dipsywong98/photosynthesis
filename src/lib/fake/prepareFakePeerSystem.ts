import { PeerFactory } from '../PeerFactory'
import { FakePeer } from './FakePeer'

export const prepareFakePeerSystem = (): void => {
  beforeEach(() => {
    PeerFactory.useFake = true
    FakePeer.allPeers = {}
  })
}
