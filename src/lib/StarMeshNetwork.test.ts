import { PeerFactory } from './PeerFactory'
import { StarMeshNetwork, StarMeshNetworkEvents, StarMeshReducer } from './StarMeshNetwork'
import { ConnectionManager } from './ConnectionManager'
import { pause } from './pause'

PeerFactory.useFake = true

describe('StarMeshNetwork', () => {
  it('can host and join', async (done) => {
    const manager1 = await ConnectionManager.startAs('1')
    const manager2 = await ConnectionManager.startAs('2')
    const manager3 = await ConnectionManager.startAs('3')
    const net1 = new StarMeshNetwork(manager1, {})
    const net2 = new StarMeshNetwork(manager2, {})
    const net3 = new StarMeshNetwork(manager3, {})
    await net1.joinOrHost('my-net')
    await net2.joinOrHost('my-net')
    expect(net1.isHost()).toEqual(true)
    expect(net2.isHost()).toEqual(false)
    expect(net3.isHost()).toEqual(undefined)
    expect(net2.members.includes(net1.id)).toBeTruthy()
    expect(net2.members.includes(net2.id)).toBeTruthy()
    expect(net1.members.includes(net1.id)).toBeTruthy()
    expect(net1.members.includes(net2.id)).toBeTruthy()
    await pause(1)
    expect(net1.myConnectionManager.connections.map(({ id }) => id)).toEqual([
      net1.hostConnectionManager?.id,
      net1.id,
      net2.id
    ])
    expect(net2.myConnectionManager.connections.map(({ id }) => id)).toEqual([
      net1.hostConnectionManager?.id,
      net1.id,
      net2.id
    ])
    expect(net3.members.length).toBe(0)
    done()
  })

  it('can set and validate state', async (done) => {
    const manager1 = await ConnectionManager.startAs('1')
    const manager2 = await ConnectionManager.startAs('2')
    const net1 = new StarMeshNetwork(manager1, {})
    const net2 = new StarMeshNetwork(manager2, {})
    await net1.joinOrHost('my-net')
    await net2.joinOrHost('my-net')
    const SET_FOO = 'SET_FOO'
    const reducer: StarMeshReducer = (prevState, { action, payload }) => {
      switch (action) {
        case SET_FOO:
          return { ...prevState, foo: payload }
        default:
          throw new Error('invalid action')
      }
    }
    net1.setReducer(reducer)
    net2.setReducer(reducer)
    net2.on(StarMeshNetworkEvents.STATE_CHANGE, (state) => {
      expect(state).toEqual({
        foo: 123
      })
    })
    await pause(1)
    await net1.dispatch({
      action: SET_FOO,
      payload: 123
    })
    expect(net1.state).toEqual({
      foo: 123
    })
    expect(net2.state).toEqual({
      foo: 123
    })
    expect(
      net1.dispatch({
        action: 'random',
        payload: 123
      })
    ).rejects.toEqual('invalid action')

    done()
  })
})
