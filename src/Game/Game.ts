import { Room, RoomActionTypes } from '../lib/Room'
import { Observable } from '../lib/Observable'
import GameWorld from './GameWorld'
import { StarMeshAction, StarMeshNetworkEvents, StarMeshReducer } from '../lib/StarMeshNetwork'
import { GameState } from './types/GameState'
import { getInitialState } from './getInitialState'
import { Axial } from '../3d/Coordinates/Axial'
import { ACTION_COST_GROW, ACTION_COST_PURCHASE, ACTION_COST_SEED, Color, GrowthStage } from '../3d/constants'
import { TileInfo } from './types/TileInfo'
import { clone } from 'ramda'
import { isTreeGrowthStage } from './isTreeGrowthStage'

export enum GameEvent {
  UPDATE_GAME_STATE,
  GAME_OVER,
  ACTIVE_OBJECT_CHANGED
}

export enum GameActions {
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

  public get mi (): Color {
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
    this.gameWorld.onActiveObjectChange(() => {
      this.emit(GameEvent.ACTIVE_OBJECT_CHANGED, { data: { activeAxial: this.gameWorld.getActiveAxial() } })
    })
  }

  public start (_gameState: GameState): void {
    this.gameWorld.resetBoard()
  }

  public rejoin (gameState: GameState): void {
    Object.entries(gameState.board).forEach(([axialString, tileInfo]) => {
      if (tileInfo.color !== undefined && tileInfo.growthStage !== undefined) {
        this.setTile(gameState, Axial.fromString(axialString), tileInfo)
      }
    })
    this.setRayDirection(gameState, gameState.rayDirection)
  }

  public stop (payload: unknown): void {
    this.emit(GameEvent.GAME_OVER, { data: payload })
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
        if (gameState.preparingRound === 0) {
          gameState.rayDirection = 1
          gameState.revolutionLeft++
        }
      }
      if (gameState.preparingRound === 0) {
        gameState.rayDirection = (gameState.rayDirection + 5) % 6
        if (gameState.rayDirection === 0) {
          gameState.rayDirection = 0
          gameState.revolutionLeft--
        }
        gameState = this.setRayDirection(gameState, gameState.rayDirection)
      }
      gameState.turn = 0
      if (gameState.revolutionLeft <= 0) {
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
      if (isTreeGrowthStage(tile.growthStage)) {
        let axial = Axial.fromString(axialString)
        for (let distance = 0; distance < tile.growthStage; distance++) {
          axial = axial.add(Axial.neighbors[direction])
          shadows[axial.toString()] = Math.max(shadows[axial.toString()] ?? 0, tile.growthStage)
        }
      }
    })
    Object.entries(gameState.board).forEach(([axialString, tile]) => {
      if (isTreeGrowthStage(tile.growthStage)) {
        if (tile.color !== undefined && tile.growthStage > (shadows[axialString] ?? 0)) {
          gameState.playerInfo[tile.color].lightPoint += tile.growthStage as number
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
    gameState.gameOver = `${winningsPlayerIds.map(i => this.room.whoami(i)).join(', ')} ${winningsPlayerIds.length === 1 ? 'wins' : 'win'}`
    return { ...gameState }
  }

  public async growTree (axial: Axial): Promise<void> {
    return await this.dispatch({
      action: GameActions.GROW_TREE,
      payload: axial.toString()
    })
  }

  public growTreeHandler (gameState: GameState, playerId: number, axial: Axial): GameState {
    if (!(axial.toString() in gameState.board)) {
      throw new Error(`${axial.toString()} is not in game board`)
    }
    if (gameState.dirtyTiles.includes(axial.toString())) {
      throw new Error('Cannot act on same tile twice')
    }
    if (gameState.preparingRound > 0) {
      if (gameState.board[axial.toString()].growthStage !== undefined) {
        throw new Error('Already occupied')
      }
      if (gameState.board[axial.toString()].leaves !== 1) {
        throw new Error('First round can only grow tree on tile with 1 leaf')
      }
      --gameState.playerInfo[playerId].availableArea[GrowthStage.SHORT]
      gameState = this.setTile(gameState, axial, { color: playerId, growthStage: GrowthStage.SHORT })
      gameState = this.endTurnHandler(gameState, playerId)
    } else {
      if (gameState.board[axial.toString()].color !== playerId) {
        throw new Error('You can only grow trees that belong to you')
      }

      const existingStage = gameState.board[axial.toString()].growthStage
      if (existingStage === undefined) {
        throw new Error('Please use growSeed method to plant a seed')
      }

      if (gameState.playerInfo[playerId].lightPoint < ACTION_COST_GROW[existingStage]) {
        throw new Error(`Not enough light point, needed ${ACTION_COST_GROW[existingStage]}, but only have ${gameState.playerInfo[playerId].lightPoint}`)
      }
      if (existingStage !== GrowthStage.TALL && gameState.playerInfo[playerId].availableArea[existingStage + 1 as GrowthStage] <= 0) {
        throw new Error(`Not enough ${GrowthStage[existingStage + 1]}, you need to buy it with light points before growing`)
      }
      gameState.playerInfo[playerId].lightPoint -= ACTION_COST_GROW[existingStage]
      if (existingStage === GrowthStage.TALL) {
        gameState = this.resetTile(gameState, axial)
        gameState = this.returnTree(gameState, playerId, GrowthStage.TALL)
        gameState = this.obtainToken(gameState, playerId, axial)
      } else {
        gameState.playerInfo[playerId].availableArea[existingStage + 1 as GrowthStage]--
        gameState = this.setTile(gameState, axial, { color: playerId, growthStage: existingStage + 1 })
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
    if (!(source.toString() in gameState.board)) {
      throw new Error(`${source.toString()} is not in game board`)
    }
    if (!(target.toString() in gameState.board)) {
      throw new Error(`${target.toString()} is not in game board`)
    }
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
    if (!isTreeGrowthStage(tileInfo.growthStage)) {
      throw new Error('Source tile needed to be a tree')
    }
    if (tileInfo.color !== playerId) {
      throw new Error('Cannot use other\'s tree as source')
    }
    if (source.tileDistance(target) > tileInfo.growthStage) {
      throw new Error('Seed is too far from tree')
    }
    if (gameState.playerInfo[playerId].lightPoint < ACTION_COST_SEED) {
      throw new Error(`Need ${ACTION_COST_SEED} light points, but only got ${gameState.playerInfo[playerId].lightPoint}`)
    }
    gameState.dirtyTiles.push(source.toString(), target.toString())
    gameState.playerInfo[playerId].lightPoint -= ACTION_COST_SEED
    gameState.playerInfo[playerId].availableArea[GrowthStage.SEED]--
    gameState = this.setTile(gameState, target, { color: playerId, growthStage: GrowthStage.SEED })
    return gameState
  }

  public async purchase (stage: GrowthStage): Promise<void> {
    return await this.dispatch({
      action: GameActions.PURCHASE,
      payload: stage
    })
  }

  public haveSlot (gameState: GameState, playerId: number, stage: GrowthStage): boolean {
    return gameState.playerInfo[playerId].playerBoard[stage].reduce((flag, current) => flag || !current, false)
  }

  public static nextPurchase (gameState: GameState, playerId: number, stage: GrowthStage): { cost: number, purchaseIndex: number } {
    let purchaseIndex: number
    for (purchaseIndex = 0; purchaseIndex < gameState.playerInfo[playerId].playerBoard[stage].length; purchaseIndex++) {
      if (gameState.playerInfo[playerId].playerBoard[stage][purchaseIndex]) {
        break
      }
    }
    return {
      purchaseIndex,
      cost: ACTION_COST_PURCHASE[stage][purchaseIndex]
    }
  }

  public purchaseHandler (gameState: GameState, playerId: number, stage: GrowthStage): GameState {
    if (gameState.preparingRound > 0) {
      throw new Error('Cannot purchase at preparing round')
    }
    const { purchaseIndex, cost } = Game.nextPurchase(gameState, playerId, stage)
    if (gameState.playerInfo[playerId].lightPoint < cost) {
      throw new Error(`Not enough light point to purchase ${GrowthStage[stage]}, ${cost.toString()} needed but only have ${gameState.playerInfo[playerId].lightPoint}`)
    }
    gameState.playerInfo[playerId].lightPoint -= cost
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

  public setTile (gameState: GameState, axial: Axial, tileInfo: Partial<TileInfo>): GameState {
    gameState.board[axial.toString()].growthStage = tileInfo.growthStage
    gameState.board[axial.toString()].color = tileInfo.color
    this.gameWorld.setTile(axial, tileInfo)
    return gameState
  }

  private resetTile (gameState: GameState, axial: Axial): GameState {
    gameState.board[axial.toString()].color = undefined
    gameState.board[axial.toString()].growthStage = undefined
    this.gameWorld.setTile(axial)
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

  public nextToken (gameState: GameState, axial: Axial): { leaves: number, score: number } {
    for (let leaves = gameState.board[axial.toString()].leaves; leaves >= 1; leaves--) {
      const scoreToken = gameState.scoreTokens[leaves]
      const score = scoreToken[0]
      if (score !== undefined) {
        return {
          leaves,
          score
        }
      }
    }
    return {
      leaves: 0, score: 0
    }
  }

  private obtainToken (gameState: GameState, playerId: number, axial: Axial): GameState {
    const { leaves } = this.nextToken(gameState, axial)
    const amount = gameState.scoreTokens[leaves].shift()
    gameState.playerInfo[playerId].score += amount ?? 0
    return gameState
  }

  private setRayDirection (gameState: GameState, rayDirection: number): GameState {
    gameState.rayDirection = rayDirection
    this.gameWorld.setRayDirection(rayDirection)
    return gameState
  }
}
