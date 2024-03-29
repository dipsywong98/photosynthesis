import { StarMeshNetwork, StarMeshNetworkEvents, StarMeshReducer } from './StarMeshNetwork'
import { ConnectionManager } from './ConnectionManager'
import { pause } from './pause'
import { prepareFakePeerSystem } from './fake/prepareFakePeerSystem'

const SET_FOO = 'SET_FOO'
const reducer: StarMeshReducer<Record<string, unknown>> = (prevState, { action, payload }) => {
  switch (action) {
    case SET_FOO:
      return { ...prevState, foo: payload }
    default:
      throw new Error('invalid action')
  }
}

prepareFakePeerSystem()

describe('StarMeshNetwork', () => {
  describe('can handle members change ', () => {
    it('can host and join', async () => {
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
    })

    it('can set and validate state', async () => {
      const manager1 = await ConnectionManager.startAs('1')
      const manager2 = await ConnectionManager.startAs('2')
      const net1 = new StarMeshNetwork(manager1, {})
      const net2 = new StarMeshNetwork(manager2, {})
      await net1.joinOrHost('my-net')
      await net2.joinOrHost('my-net')
      net1.setReducer(reducer)
      net2.setReducer(reducer)
      net2.on(StarMeshNetworkEvents.STATE_CHANGE, ({ state }) => {
        expect(state).toEqual({
          foo: 123
        })
      })
      await pause(100)
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
      })).rejects.toThrowError('invalid action')
    })

    it('can handle disconnect of member', async () => {
      const manager1 = await ConnectionManager.startAs('1')
      const manager2 = await ConnectionManager.startAs('2')
      const net1 = new StarMeshNetwork(manager1, {})
      const net2 = new StarMeshNetwork(manager2, {})
      await net1.joinOrHost('my-net')
      await net2.joinOrHost('my-net')
      await pause(1)
      expect(net1.members).toContain(net2.id)
      net2.leave()
      // manager2.destroy()
      await pause(1)
      expect(net1.members).not.toContain(net2.id)
      expect(net1.isHost()).toBeTruthy()
      await pause(1)
    })

    it('can handle disconnect of host', async () => {
      const manager1 = await ConnectionManager.startAs('1')
      const manager2 = await ConnectionManager.startAs('2')
      const manager3 = await ConnectionManager.startAs('3')
      const net1 = new StarMeshNetwork(manager1, {})
      const net2 = new StarMeshNetwork(manager2, {})
      const net3 = new StarMeshNetwork(manager3, {})
      net2.setReducer(reducer)
      net3.setReducer(reducer)
      await net1.joinOrHost('my-net')
      await net2.joinOrHost('my-net')
      await pause(1)
      expect(net1.members).toContain(net2.id)
      net1.leave()
      // net1.hostConnectionManager?.destroy()
      // manager1.disconnectAll()
      // net1.hostConnectionManager?.disconnectAll()
      await pause(100)
      expect(net2.members).not.toContain(net1.id)
      expect(net2.isHost()).toBeTruthy()
      await net3.joinOrHost('my-net')
      await pause(2)
      expect(net2.members).toContain(net3.id)
      expect(net2.members).not.toContain(net1.id)
      expect(net3.members).toContain(net2.id)
      expect(net3.members).toContain(net3.id)
      expect(net3.members.length).toEqual(2)
      expect(net3.members).not.toContain(net1.id)
      expect(net2.myConnectionManager.connections.map(({ id }) => id)).toEqual([
        net2.id,
        net2.hostConnectionManager?.id,
        net3.id
      ])
      const connections = net3.myConnectionManager.connections.map(({ id }) => id)
      expect(connections).toContain(net2.hostConnectionManager?.id)
      expect(connections).toContain(net2.id)
      expect(connections).toContain(net3.id)
      expect(connections).toHaveLength(3)
      const SET_FOO = 'SET_FOO'
      await pause(1)
      await net3.dispatch({
        action: SET_FOO,
        payload: 123
      })
      await pause(1)
      expect(net2.state).toEqual({
        foo: 123
      })
      expect(net3.state).toEqual({
        foo: 123
      })
    })
  })

  describe('can do state management', () => {
    it('can get existing state', async () => {
      const manager1 = await ConnectionManager.startAs('1')
      const manager2 = await ConnectionManager.startAs('2')
      const manager3 = await ConnectionManager.startAs('3')
      const net1 = new StarMeshNetwork<Record<string, unknown>>(manager1, { foo: 0 })
      const net2 = new StarMeshNetwork(manager2, {})
      const net3 = new StarMeshNetwork(manager3, {})
      expect(net2.state).toEqual({})
      expect(net3.state).toEqual({})
      net1.setReducer(reducer)
      net2.setReducer(reducer)
      net3.setReducer(reducer)
      console.log('1')
      await net1.joinOrHost('my-net')
      await net2.joinOrHost('my-net')
      console.log('2')
      expect(net2.state).toEqual({
        foo: 0
      })
      net1.leave()
      await pause(100)
      expect(net2.members).not.toContain(net1.id)
      expect(net2.isHost()).toBeTruthy()
      console.log('3')
      await pause(1)
      await net3.joinOrHost('my-net')
      console.log('4')
      expect(net3.state).toEqual({
        foo: 0
      })
    })

    it('can dispatch state change request if no active request', async () => {
      const manager1 = await ConnectionManager.startAs('1')
      const manager2 = await ConnectionManager.startAs('2')
      const net1 = new StarMeshNetwork<Record<string, unknown>>(manager1, { foo: 0 })
      const net2 = new StarMeshNetwork(manager2, {})
      net1.setReducer(reducer)
      net2.setReducer(reducer)
      await net1.joinOrHost('my-net')
      await net2.joinOrHost('my-net')
      const promise = net1.dispatch({
        action: SET_FOO,
        payload: 123
      })
      expect(net1.activeAction).toEqual({
        action: SET_FOO,
        payload: 123
      })
      await promise
      expect(net1.activeAction).toEqual(undefined)
    })

    it('can queue state change request if previous action hasnt resolved', async () => {
      const manager1 = await ConnectionManager.startAs('1')
      const manager2 = await ConnectionManager.startAs('2')
      const net1 = new StarMeshNetwork<Record<string, unknown>>(manager1, { foo: 0 })
      const net2 = new StarMeshNetwork(manager2, {})
      net1.setReducer(reducer)
      net2.setReducer(reducer)
      await net1.joinOrHost('my-net')
      await net2.joinOrHost('my-net')
      const promise1 = net1.dispatch({
        action: SET_FOO,
        payload: 123
      })
      expect(net1.activeAction).toEqual({
        action: SET_FOO,
        payload: 123
      })
      const promise2 = net1.dispatch({
        action: SET_FOO,
        payload: 456
      })
      await promise1
      expect(net1.state).toEqual({
        foo: 123
      })
      expect(net2.state).toEqual({
        foo: 123
      })
      if (promise2 !== undefined) {
        await promise2
      }
      expect(net1.state).toEqual({
        foo: 456
      })
      expect(net2.state).toEqual({
        foo: 456
      })
    })

    it('can queue state change request if other has staging change', async () => {
      const manager1 = await ConnectionManager.startAs('1')
      const manager2 = await ConnectionManager.startAs('2')
      const net1 = new StarMeshNetwork<Record<string, unknown>>(manager1, { foo: 0 })
      const net2 = new StarMeshNetwork(manager2, {})
      net1.setReducer(reducer)
      net2.setReducer(reducer)
      await net1.joinOrHost('my-net')
      await net2.joinOrHost('my-net')
      net2.stateStaging = {
        foo: -1
      }
      const promise = net1.dispatch({
        action: SET_FOO,
        payload: 123
      })
      await pause(100)
      expect(net1.state).toEqual({
        foo: 0
      })
      expect(net2.state).toEqual({
        foo: 0
      })
      net2.stateStaging = undefined
      await promise
      expect(net1.state).toEqual({
        foo: 123
      })
      expect(net2.state).toEqual({
        foo: 123
      })
    })

    it('can rollback if one if the network member reject the change', async () => {
      const manager1 = await ConnectionManager.startAs('1')
      const manager2 = await ConnectionManager.startAs('2')
      const net1 = new StarMeshNetwork<Record<string, unknown>>(manager1, { foo: 0 })
      const net2 = new StarMeshNetwork(manager2, {})
      net1.setReducer(reducer)
      net2.setReducer(reducer)
      await net1.joinOrHost('my-net')
      await net2.joinOrHost('my-net')
      const promise1 = net1.dispatch({
        action: SET_FOO,
        payload: 123
      })
      expect(net1.activeAction).toEqual({
        action: SET_FOO,
        payload: 123
      })
      net2.setReducer(() => {
        throw new Error('invalid action')
      })
      const promise2 = net1.dispatch({
        action: SET_FOO,
        payload: 456
      })
      await promise1.catch(() => console.log('fail promise 1'))
      expect(net1.state).toEqual({
        foo: 123
      })
      expect(net2.state).toEqual({
        foo: 123
      })
      if (promise2 !== undefined) {
        await expect(promise2).rejects.toEqual(new Error('invalid action'))
      }
      expect(net2.state).toEqual({
        foo: 123
      })
      expect(net1.state).toEqual({
        foo: 123
      })
    })

    // describe('can validate state change request and cache a staging state, then response a checksum', () => {
    //   //
    // })
    //
    // describe('can collect checksum and notify all to promote the staging state', () => {
    //   //
    // })
    //
    // describe('can pop queue when clear current active request', () => {
    //   //
    // })
  })

  describe('subscribable events', () => {
    it('triggers set state when connected', async () => {
      const manager1 = await ConnectionManager.startAs('1')
      const manager2 = await ConnectionManager.startAs('2')
      const net1 = new StarMeshNetwork(manager1, { foo: 0 })
      const net2 = new StarMeshNetwork(manager2, {})
      const fb = jest.fn()
      net2.on(StarMeshNetworkEvents.STATE_CHANGE, fb)
      await net1.joinOrHost('my-net')
      await net2.joinOrHost('my-net')
      expect(fb).toHaveBeenCalledWith({
        state: {
          foo: 0
        }
      })
    })

    it('triggers set state when dispatch', async () => {
      const manager1 = await ConnectionManager.startAs('1')
      const manager2 = await ConnectionManager.startAs('2')
      const net1 = new StarMeshNetwork(manager1, { foo: 0 }, reducer)
      const net2 = new StarMeshNetwork(manager2, {}, reducer)
      await net1.joinOrHost('my-net')
      await net2.joinOrHost('my-net')
      const fb1 = jest.fn()
      const fb2 = jest.fn()
      net1.on(StarMeshNetworkEvents.STATE_CHANGE, fb1)
      net2.on(StarMeshNetworkEvents.STATE_CHANGE, fb2)
      await net2.dispatch({
        action: SET_FOO,
        payload: 123
      })
      expect(fb1).toHaveBeenCalledWith({
        state: {
          foo: 123
        }
      })
      expect(fb2).toHaveBeenCalledWith({
        state: {
          foo: 123
        }
      })
    })

    it('triggers member join, left, member change when someone join', async () => {
      const manager1 = await ConnectionManager.startAs('1')
      const manager2 = await ConnectionManager.startAs('2')
      const net1 = new StarMeshNetwork(manager1, { foo: 0 })
      const net2 = new StarMeshNetwork(manager2, {})
      const fb1c = jest.fn()
      const fb1j = jest.fn()
      const fb1l = jest.fn()
      const fb2c = jest.fn()
      const fb2j = jest.fn()
      net1.on(StarMeshNetworkEvents.MEMBERS_JOIN, fb1j)
      net1.on(StarMeshNetworkEvents.MEMBERS_CHANGE, fb1c)
      net1.on(StarMeshNetworkEvents.MEMBERS_LEFT, fb1l)
      net2.on(StarMeshNetworkEvents.MEMBERS_JOIN, fb2j)
      net2.on(StarMeshNetworkEvents.MEMBERS_CHANGE, fb2c)
      await net1.joinOrHost('my-net')
      expect(fb1j).toHaveBeenCalledWith({ members: ['1'] })
      expect(fb1c).toHaveBeenCalledWith({ members: ['1'] })
      expect(net1.members).toEqual(['1'])
      await net2.joinOrHost('my-net')
      await pause(5)
      expect(net1.members).toEqual(['1', '2'])
      expect(net2.members).toEqual(['1', '2'])
      expect(fb1c).toHaveBeenCalledTimes(2)
      expect(fb1c).toHaveBeenCalledWith({
        members: ['1', '2']
      })
      expect(fb1j).toHaveBeenCalledWith({
        members: ['2']
      })
      expect(fb1j).toHaveBeenCalledWith({ members: ['1'] })
      expect(fb1j).toHaveBeenCalledWith({ members: ['2'] })
      expect(fb2c).toHaveBeenCalledWith({
        members: ['1', '2']
      })
      expect(fb2c).toHaveBeenCalledWith({
        members: ['1', '2']
      })
      net2.myConnectionManager.destroy()
      await pause(5)
      expect(fb1c).toHaveBeenCalledTimes(3)
      expect(fb1c).toHaveBeenCalledWith({
        members: ['1']
      })
      expect(fb1l).toHaveBeenCalledWith({
        members: ['2']
      })
    })
  })
})
