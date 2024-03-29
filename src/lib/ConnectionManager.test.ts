import { ConnectionManager } from './ConnectionManager'
import { ConnEvent } from './ConnectionTypes'
import { PkgType } from './PkgType'
import { pause } from './pause'
import { prepareFakePeerSystem } from './fake/prepareFakePeerSystem'

prepareFakePeerSystem()

describe('Connection Manager', () => {
  it('can be constructed', () => {
    const manager = new ConnectionManager()
    expect(manager).toBeTruthy()
  })

  it('can connect to another manager', async () => {
    const manager1 = await ConnectionManager.startPrefix('1')
    const manager2 = await ConnectionManager.startPrefix('2')
    const promise = manager2.until(ConnEvent.CONN_OPEN)
    await manager1.connectPrefix('2')
    await promise
  })

  it('can send to another manager', async () => {
    const manager1 = await ConnectionManager.startPrefix('1')
    const manager2 = await ConnectionManager.startPrefix('2')
    await manager1.connectPrefix('2')
    manager2.onPkg(PkgType.ALERT, ({ data, ack }) => {
      expect(data).toEqual('123')
      ack?.('456')
    })
    await pause(1)
    const { data: ret } = await manager1.sendPkg(manager2.id, PkgType.ALERT, '123')
    expect(ret).toEqual('456')
  })

  // it('can handle disconnection', async () => {
  //   const manager1 = await ConnectionManager.startPrefix('1')
  //   const manager2 = await ConnectionManager.startPrefix('2')
  //   await manager1.connectPrefix('2')
  //   expect(manager1.connections.length).toEqual(1)
  //   manager2.close()
  //   while (manager1.connections.length !== 0) {
  //     await pause(10)
  //   }
  //   expect(manager1.connections.length).toEqual(0)
  // })
})
