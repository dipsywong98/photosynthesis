import { Room } from './Room'
import { prepareFakePeerSystem } from './fake/prepareFakePeerSystem'
import { ConnectionManager } from './ConnectionManager'
import { pause } from './pause'

prepareFakePeerSystem()
jest.mock('../Game/GameWorld')

describe('Room', () => {
  it('can be constructed', async () => {
    const manager = await ConnectionManager.startAs('1')
    expect(new Room(manager)).toBeTruthy()
  })

  it('can join or create', async () => {
    const manager1 = await ConnectionManager.startAs('1')
    const manager2 = await ConnectionManager.startAs('2')
    const room1 = new Room(manager1)
    const room2 = new Room(manager2)
    await room1.create('peter', 'my-room')
    await pause(10)
    expect(room1.players).toEqual({
      1: 'peter'
    })
    await room2.join('daniel', 'my-room')
    expect(room2.players).toEqual({
      1: 'peter',
      2: 'daniel'
    })
  })

  it('can allow member leave', async () => {
    const manager1 = await ConnectionManager.startAs('1')
    const manager2 = await ConnectionManager.startAs('2')
    const room1 = new Room(manager1)
    const room2 = new Room(manager2)
    await room1.create('peter', 'my-room')
    await room2.join('daniel', 'my-room')
    await pause(10)
    expect(room2.players).toEqual({
      1: 'peter',
      2: 'daniel'
    })
    room2.leaveRoom()
    await pause(5)
    expect(room2.players).toEqual({})
    expect(room1.players).toEqual({
      1: 'peter'
    })
    expect(room1.hostPlayerId).toEqual('1')
  })

  // it('can allow host leave', async () => {
  //   const manager1 = await ConnectionManager.startAs('1')
  //   const manager2 = await ConnectionManager.startAs('2')
  //   const room1 = new Room(manager1)
  //   const room2 = new Room(manager2)
  //   await room1.create('peter', 'my-room')
  //   await room2.join('daniel', 'my-room')
  //   await pause(10)
  //   expect(room1.players).toEqual({
  //     1: 'peter',
  //     2: 'daniel'
  //   })
  //   room1.leaveRoom()
  //   expect(room1.players).toEqual({})
  //   expect(room2.players).toEqual({
  //     2: 'daniel'
  //   })
  //   expect(room2.hostPlayerId).toEqual('2')
  //   done()
  // })
  //
  // it('can rename', async () => {
  //   const manager1 = await ConnectionManager.startAs('1')
  //   const manager2 = await ConnectionManager.startAs('2')
  //   const room1 = new Room(manager1)
  //   const room2 = new Room(manager2)
  //   await room1.create('peter', 'my-room')
  //   await room2.join('daniel', 'my-room')
  //   expect(room1.players).toEqual({
  //     1: 'peter',
  //     2: 'daniel'
  //   })
  //   expect(room2.players).toEqual({
  //     1: 'peter',
  //     2: 'daniel'
  //   })
  //   await room2.rename('dipsy')
  //   expect(room1.players).toEqual({
  //     1: 'peter',
  //     2: 'dipsy'
  //   })
  //   expect(room2.players).toEqual({
  //     1: 'peter',
  //     2: 'dipsy'
  //   })
  //   done()
  // })
  //
  // it('can block duplicate name', async () => {
  //   const manager1 = await ConnectionManager.startAs('1')
  //   const manager2 = await ConnectionManager.startAs('2')
  //   const room1 = new Room(manager1)
  //   const room2 = new Room(manager2)
  //   await room1.create('peter', 'my-room')
  //   await expect(room2.join('peter', 'my-room')).rejects.toThrowError('Name \'peter\' already taken')
  //   expect(room1.players).toEqual({
  //     1: 'peter'
  //   })
  //   expect(room2.players).toEqual({})
  //   await room2.join('daniel', 'my-room')
  //   await expect(room2.rename('peter')).rejects.toThrowError('Name \'peter\' already taken')
  //   expect(room1.players).toEqual({
  //     1: 'peter',
  //     2: 'daniel'
  //   })
  //   expect(room2.players).toEqual({
  //     1: 'peter',
  //     2: 'daniel'
  //   })
  //   done()
  // })

  it('can block too much players', async () => {
    const manager = await Promise.all('01234'.split('').map(async (c: string) => await ConnectionManager.startAs(c)))
    const room = manager.map(m => new Room(m))
    await room[0].joinOrCreate('p0', 'my-room')
    await room[1].joinOrCreate('p1', 'my-room')
    await room[2].joinOrCreate('p2', 'my-room')
    await room[3].joinOrCreate('p3', 'my-room')
    await expect(room[4].joinOrCreate('p4', 'my-room')).rejects.toThrowError('Room \'my-room\' is already full')
  })

  it('can start game', async () => {
    const manager1 = await ConnectionManager.startAs('11')
    const manager2 = await ConnectionManager.startAs('12')
    const room1 = new Room(manager1)
    const room2 = new Room(manager2)
    await room1.create('peter', 'my-room')
    await room2.join('daniel', 'my-room')
    await room1.startGame()
    expect(room1.p(0)).toEqual('11')
    expect(room1.p(1)).toEqual('12')
    expect(room2.p(0)).toEqual('11')
    expect(room2.p(1)).toEqual('12')
    expect(room1.p(11)).toEqual('0')
    expect(room1.p(12)).toEqual('1')
    expect(room2.p(11)).toEqual('0')
    expect(room2.p(12)).toEqual('1')
    expect(room1.n('peter')).toEqual('0')
    expect(room1.n('daniel')).toEqual('1')
    expect(room2.n('peter')).toEqual('0')
    expect(room2.n('daniel')).toEqual('1')
  })

  it('can block start game if not enough player', async () => {
    const manager1 = await ConnectionManager.startAs('1')
    const room1 = new Room(manager1)
    await room1.create('peter', 'my-room')
    await expect(room1.startGame()).rejects.toThrowError('Not enough players, required 2')
  })

  it('can block join if the game has started and the guy is new', async () => {
    const manager1 = await ConnectionManager.startAs('11')
    const manager2 = await ConnectionManager.startAs('12')
    const manager3 = await ConnectionManager.startAs('13')
    const room1 = new Room(manager1)
    const room2 = new Room(manager2)
    const room3 = new Room(manager3)
    await room1.create('peter', 'my-room')
    await room2.join('daniel', 'my-room')
    await room1.startGame()
    await expect(room3.join('dipsy', 'my-room')).rejects.toThrowError("Room 'my-room' has started game")
  })

  it('can rejoin game', async () => {
    const manager1 = await ConnectionManager.startAs('11')
    const manager2 = await ConnectionManager.startAs('12')
    const manager3 = await ConnectionManager.startAs('13')
    const room1 = new Room(manager1)
    const room2 = new Room(manager2)
    const room3 = new Room(manager3)
    await room1.create('peter', 'my-room')
    await room2.join('daniel', 'my-room')
    await room1.startGame()
    room2.leaveRoom()
    await pause(10)
    await room3.join('daniel', 'my-room')
    expect(room1.p(0)).toEqual('11')
    expect(room1.p(1)).toEqual('13')
    expect(room3.p(0)).toEqual('11')
    expect(room3.p(1)).toEqual('13')
    expect(room1.n('peter')).toEqual('0')
    expect(room1.n('daniel')).toEqual('1')
    expect(room3.n('peter')).toEqual('0')
    expect(room3.n('daniel')).toEqual('1')
  })
})
