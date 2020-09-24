import { Room, RoomActionTypes } from '../lib/Room'
import { Observable } from '../lib/Observable'
import GameWorld from './GameWorld'
import { StarMeshAction, StarMeshNetworkEvents, StarMeshReducer } from '../lib/StarMeshNetwork'
import { GameState } from './types/GameState'
import { getInitialState } from './getInitialState'
import { Axial } from '../3d/Coordinates/Axial'
import { Color, costs, GrowthStage, isTree } from '../3d/constants'
import { TileInfo } from './types/TileInfo'
import { clone } from 'ramda'

export enum GameEvent {
  UPDATE_GAME_STATE,
  REQUEST_GAME_STATE,
  GAME_OVER,
  CLICK,
  GAME_INIT
}

export enum GameActions {
  CLICK,
  GROW_TREE,
  END_TURN,
  PLANT_SEED,
  PURCHASE,
}

export type Coords = [number, number]

export interface GameEventPayload {
  data: unknown
}

export class Game extends Observable<typeof GameEvent, GameEventPayload> {
  room: Room
  gameWorld = new GameWorld()

  public get started (): boolean {
    return this.room.started
  }

  public get state (): GameState | undefined {
    return this.room.network.state.game
  }

  public static initialState (players: number): GameState {
    return getInitialState(players)
  }

  public get me (): string {
    return this.room.p(this.room.myId)
  }

  public get mi (): number {
    return Number.parseInt(this.me)
  }

  public get nPlayers (): number {
    return this.room.playerIds.length
  }

  constructor (room: Room) {
    super()
    this.room = room
    this.room.network.on(StarMeshNetworkEvents.STATE_CHANGE, ({ state }) => {
      this.emit(GameEvent.UPDATE_GAME_STATE, { data: state?.game })
    })
  }

  public start (): void {
    // this.gameWorld.resetWorld()
  }

  public stop (payload: unknown): void {
    this.emit(GameEvent.GAME_OVER, { data: payload })
    // this.gameWorld.dispose()
  }

  public async click (x: number, y: number): Promise<void> {
    return await this.dispatch({
      action: GameActions.CLICK,
      payload: [x, y]
    }).catch(this.errorHandler)
  }

  public async endTurn (): Promise<void> {
    return await this.dispatch({
      action: GameActions.END_TURN,
      payload: []
    })
  }

  public endTurnHandler (gameState: GameState, _playerId: number): GameState {
    gameState.turn++
    gameState.dirtyTiles = []
    if (gameState.turn === this.nPlayers) {
      if (gameState.preparingRound > 0) {
        gameState.preparingRound--
      } else if (gameState.preparingRound === 0) {
        gameState.rayDirection++
        if (gameState.rayDirection === 6) {
          gameState.rayDirection = 0
          gameState.revolutionLeft--
        }
        gameState = this.setRayDirection(gameState, gameState.rayDirection)
      }
      gameState.turn = 0
      if (gameState.revolutionLeft <= -1) {
        return this.endGameCalculation(gameState)
      }
      if (gameState.preparingRound === 0) {
        gameState = this.photosynthesis(gameState)
      }
    }
    return gameState
  }

  public photosynthesis (gameState: GameState): GameState {
    const shadows: { [axial: string]: GrowthStage } = {}
    const direction: number = gameState.rayDirection
    Object.entries(gameState.board).forEach(([axialString, tile]) => {
      if (isTree(tile.stage)) {
        let axial = Axial.fromString(axialString)
        for (let distance = 0; distance < tile.stage; distance++) {
          axial = axial.add(Axial.neighbors[direction])
          shadows[axial.toString()] = Math.max(shadows[axial.toString()] ?? 0, tile.stage)
        }
      }
    })
    Object.entries(gameState.board).forEach(([axialString, tile]) => {
      if (isTree(tile.stage)) {
        if (tile.color !== undefined && tile.stage > (shadows[axialString] ?? 0)) {
          gameState.playerInfo[tile.color].lightPoint += tile.stage
          gameState.playerInfo[tile.color].lightPoint = Math.min(gameState.playerInfo[tile.color].lightPoint, 20)
        }
      }
    })
    return gameState
  }

  public endGameCalculation (gameState: GameState): GameState {
    let winningsPlayerIds: string[] = []
    let winningScore = 0
    gameState.playerInfo.forEach((info, id) => {
      info.score += Math.floor(info.lightPoint / 3)
      info.lightPoint = 0
      if (info.score > winningScore) {
        winningScore = info.score
        winningsPlayerIds = [id.toString()]
      } else if (info.score === winningScore) {
        winningsPlayerIds.push(id.toString())
      }
    })
    gameState.gameOver = `Player '${winningsPlayerIds.map(i => this.room.whoami(i)).join(', ')}' win`
    return { ...gameState }
  }

  public async growTree (axial: Axial): Promise<void> {
    return await this.dispatch({
      action: GameActions.GROW_TREE,
      payload: axial.toString()
    })
  }

  public growTreeHandler (gameState: GameState, playerId: number, axial: Axial): GameState {
    if (gameState.dirtyTiles.includes(axial.toString())) {
      throw new Error('Cannot act on same tile twice')
    }
    if (gameState.preparingRound > 0) {
      if (gameState.board[axial.toString()].stage !== undefined) {
        throw new Error('Already occupied')
      }
      if (gameState.board[axial.toString()].leaves !== 1) {
        throw new Error('First round can only grow tree on tile with 1 leaf')
      }
      --gameState.playerInfo[playerId].availableArea[GrowthStage.SHORT]
      gameState = this.setTile(gameState, playerId, axial, GrowthStage.SHORT)
      gameState = this.endTurnHandler(gameState, playerId)
    } else {
      if (gameState.board[axial.toString()].color !== playerId) {
        throw new Error('You can only grow trees that belong to you')
      }
      const existingStage: GrowthStage | undefined = gameState.board[axial.toString()].stage
      if (existingStage === undefined) {
        throw new Error('Please use growSeed method to plant a seed')
      }

      if (gameState.playerInfo[playerId].lightPoint < costs.growth[existingStage]) {
        throw new Error(`Not enough light point, needed ${costs.growth[existingStage]}, but only have ${gameState.playerInfo[playerId].lightPoint}`)
      }
      if (existingStage !== GrowthStage.TALL && gameState.playerInfo[playerId].availableArea[existingStage + 1 as GrowthStage] <= 0) {
        throw new Error(`Not enough ${GrowthStage[existingStage + 1]}, you need to buy it with light points before growing`)
      }
      gameState.playerInfo[playerId].lightPoint -= costs.growth[existingStage]
      if (existingStage === GrowthStage.TALL) {
        gameState = this.resetTile(gameState, axial)
        gameState = this.returnTree(gameState, playerId, GrowthStage.TALL)
        gameState = this.obtainToken(gameState, playerId, axial)
      } else {
        gameState.playerInfo[playerId].availableArea[existingStage + 1 as GrowthStage]--
        gameState = this.setTile(gameState, playerId, axial, existingStage + 1 as GrowthStage)
        gameState = this.returnTree(gameState, playerId, existingStage)
      }
      gameState.dirtyTiles.push(axial.toString())
    }
    return gameState
  }

  public async plantSeed (source: Axial, target: Axial): Promise<void> {
    return await this.dispatch({
      action: GameActions.PLANT_SEED,
      payload: [source.toString(), target.toString()]
    })
  }

  public plantSeedHandler (gameState: GameState, playerId: number, source: Axial, target: Axial): GameState {
    if (gameState.preparingRound > 0) {
      throw new Error('Cannot plant seed at preparing round')
    }
    if (gameState.playerInfo[playerId].availableArea[GrowthStage.SEED] <= 0) {
      throw new Error('Not enough available seed, you need to use light point to purchase more')
    }
    if (gameState.dirtyTiles.includes(source.toString()) || gameState.dirtyTiles.includes(target.toString())) {
      throw new Error('Cannot act on same tile twice')
    }
    const tileInfo: TileInfo = gameState.board[source.toString()]
    if (!isTree(tileInfo.stage)) {
      throw new Error('Source tile needed to be a tree')
    }
    if (tileInfo.color !== playerId) {
      throw new Error('Cannot use other\'s tree as source')
    }
    if (source.tileDistance(target) > tileInfo.stage) {
      throw new Error('Seed is too far from tree')
    }
    gameState.dirtyTiles.push(source.toString(), target.toString())
    gameState.playerInfo[playerId].availableArea[GrowthStage.SEED]--
    gameState = this.setTile(gameState, playerId, target, GrowthStage.SEED)
    return gameState
  }

  public async purchase (stage: GrowthStage): Promise<void> {
    return await this.dispatch({
      action: GameActions.PURCHASE,
      payload: stage
    })
  }

  public purchaseHandler (gameState: GameState, playerId: number, stage: GrowthStage): GameState {
    if (gameState.preparingRound > 0) {
      throw new Error('Cannot purchase at preparing round')
    }
    let purchaseIndex: number
    for (purchaseIndex = 0; purchaseIndex < gameState.playerInfo[playerId].playerBoard[stage].length; purchaseIndex++) {
      if (gameState.playerInfo[playerId].playerBoard[stage][purchaseIndex]) {
        break
      }
    }
    if (gameState.playerInfo[playerId].lightPoint < costs.playerBoard[stage][purchaseIndex]) {
      throw new Error(`Not enough light point to purchase ${GrowthStage[stage]}, ${costs.playerBoard[stage][purchaseIndex].toString()} needed but only have ${gameState.playerInfo[playerId].lightPoint}`)
    }
    gameState.playerInfo[playerId].lightPoint -= costs.playerBoard[stage][purchaseIndex]
    gameState.playerInfo[playerId].playerBoard[stage][purchaseIndex] = false
    gameState.playerInfo[playerId].availableArea[stage]++
    return gameState
  }

  public dispatch = async (action: StarMeshAction): Promise<void> => {
    if (this.mi !== this.state?.turn) {
      throw new Error('not your turn')
    }
    await this.room.network.dispatch({
      action: RoomActionTypes.GAME_EVENT,
      payload: action
    })
  }

  public errorHandler = (e: Error): void => {
    console.log(e)
  }

  public reducer: StarMeshReducer<GameState> = (prevState, { action, payload }, connId) => {
    const playerId = this.room.pi(connId)
    if (prevState.turn !== playerId) {
      throw new Error('not your turn')
    }
    const gameState = clone(prevState)
    switch (action) {
      case GameActions.END_TURN: {
        return this.endTurnHandler(gameState, playerId)
      }
      case GameActions.GROW_TREE: {
        if (typeof payload !== 'string') {
          throw new Error('invalid payload')
        }
        const axial = Axial.fromString(payload)
        return this.growTreeHandler(gameState, playerId, axial)
      }
      case GameActions.PLANT_SEED: {
        if (!(Array.isArray(payload) && payload.length === 2 && typeof payload[0] === 'string' && typeof payload[1] === 'string')) {
          throw new Error('invalid payload')
        }
        const source = Axial.fromString(payload[0])
        const target = Axial.fromString(payload[1])
        return this.plantSeedHandler(gameState, playerId, source, target)
      }
      case GameActions.PURCHASE: {
        if (typeof payload !== 'number') {
          throw new Error('invalid payload')
        }
        const stage = payload as GrowthStage
        return this.purchaseHandler(gameState, playerId, stage)
      }
    }
    return prevState
  }

  private setTile (gameState: GameState, color: Color, axial: Axial, stage: GrowthStage): GameState {
    gameState.board[axial.toString()].stage = stage
    gameState.board[axial.toString()].color = color
    this.gameWorld.setTile(axial, color, stage)
    return gameState
  }

  private resetTile (gameState: GameState, axial: Axial): GameState {
    gameState.board[axial.toString()].color = undefined
    gameState.board[axial.toString()].stage = undefined
    this.gameWorld.setTile(axial, undefined, undefined)
    return gameState
  }

  private returnTree (gameState: GameState, playerId: number, stage: GrowthStage): GameState {
    for (let i = 0; i < gameState.playerInfo[playerId].playerBoard[stage].length; i++) {
      if (!gameState.playerInfo[playerId].playerBoard[stage][i]) {
        gameState.playerInfo[playerId].playerBoard[stage][i] = true
        break
      }
    }
    return gameState
  }

  private obtainToken (gameState: GameState, playerId: number, axial: Axial): GameState {
    for (let leaves = gameState.board[axial.toString()].leaves; leaves >= 1; leaves--) {
      const scoreToken = gameState.scoreTokens[leaves]
      const amount = scoreToken.shift()
      if (amount !== undefined) {
        gameState.playerInfo[playerId].score += amount
        break
      }
    }
    return gameState
  }

  private setRayDirection (gameState: GameState, rayDirection: number): GameState {
    gameState.rayDirection = rayDirection
    this.gameWorld.setRayDirection(rayDirection)
    return gameState
  }
}
