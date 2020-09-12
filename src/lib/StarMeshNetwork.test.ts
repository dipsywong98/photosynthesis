import { PeerFactory } from './PeerFactory'
import { StarMeshNetwork, StarMeshNetworkEvents, StarMeshReducer } from './StarMeshNetwork'
import { ConnectionManager } from './ConnectionManager'
import { pause } from './pause'

const SET_FOO = 'SET_FOO'
const reducer: StarMeshReducer = (prevState, { action, payload }) => {
  switch (action) {
    case SET_FOO:
      return { ...prevState, foo: payload }
    default:
      throw new Error('invalid action')
  }
}

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
    expect(net2.members.length).toEqual(2)
    expect(net1.members.length).toEqual(2)
    expect(net2.members).toContain(net1.id)
    expect(net2.members).toContain(net2.id)
    expect(net1.members).toContain(net1.id)
    expect(net1.members).toContain(net2.id)
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
    await expect(net1.dispatch({
      action: 'random',
      payload: 123
    })).rejects.toEqual('invalid action')
    done()
  })

  it('can handle disconnect of member', async (done) => {
    const manager1 = await ConnectionManager.startAs('1')
    const manager2 = await ConnectionManager.startAs('2')
    const net1 = new StarMeshNetwork(manager1, {})
    const net2 = new StarMeshNetwork(manager2, {})
    await net1.joinOrHost('my-net')
    await net2.joinOrHost('my-net')
    await pause(1)
    expect(net1.members).toContain(net2.id)
    manager2.disconnectAll()
    expect(net1.members).not.toContain(net2.id)
    expect(net1.isHost()).toBeTruthy()
    done()
  })

  it('can handle disconnect of host', async (done) => {
    const manager1 = await ConnectionManager.startAs('1')
    const manager2 = await ConnectionManager.startAs('2')
    const manager3 = await ConnectionManager.startAs('3')
    const net1 = new StarMeshNetwork(manager1, {})
    const net2 = new StarMeshNetwork(manager2, {})
    const net3 = new StarMeshNetwork(manager3, {})
    net2.setReducer(reducer)
    await net1.joinOrHost('my-net')
    await net2.joinOrHost('my-net')
    await pause(1)
    expect(net1.members).toContain(net2.id)
    net1.hostConnectionManager?.destroy()
    manager1.disconnectAll()
    net1.hostConnectionManager?.disconnectAll()
    expect(net2.members).not.toContain(net1.id)
    await pause(2)
    expect(net2.isHost()).toBeTruthy()
    await net3.joinOrHost('my-net')
    expect(net2.members).toContain(net3.id)
    expect(net3.members).toContain(net2.id)
    expect(net3.members).not.toContain(net1.id)
    const SET_FOO = 'SET_FOO'
    await net3.dispatch({
      action: SET_FOO,
      payload: 123
    })
    expect(net2.state).toEqual({
      foo: 123
    })
    done()
  })
})
