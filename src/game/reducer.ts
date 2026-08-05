import { FLEET, createBoard, toIndex, type ShipSpec } from './board.ts'
import { canPlace, placeShip, randomFleet } from './placement.ts'
import { applyShot, isFleetDestroyed, type ShotResult } from './rules.ts'
import type { Action, Coord, GameState, Ship, ShipId } from './types.ts'

const PLACEMENT_MESSAGE = 'Place your fleet, then start the game.'

function specFor(id: ShipId): ShipSpec | undefined {
  return FLEET.find((spec) => spec.id === id)
}

function firstUnplaced(fleet: Ship[]): ShipId | null {
  const spec = FLEET.find((candidate) => !fleet.some((ship) => ship.id === candidate.id))
  return spec ? spec.id : null
}

export function createInitialState(difficulty: GameState['difficulty'] = 'normal'): GameState {
  const ai = randomFleet()
  return {
    phase: 'placement',
    difficulty,
    playerBoard: createBoard(),
    aiBoard: ai.board,
    playerFleet: [],
    aiFleet: ai.fleet,
    ai: { fired: new Set(), queue: [], hits: [] },
    selectedShipId: FLEET[0].id,
    orientation: 'H',
    message: PLACEMENT_MESSAGE,
    stats: { playerShots: 0, playerHits: 0, aiShots: 0, aiHits: 0 },
    animating: null,
    winner: null,
  }
}

function shipName(fleet: Ship[], id: ShipId): string {
  const ship = fleet.find((candidate) => candidate.id === id)
  return ship ? ship.name : id
}

function playerMessage(result: ShotResult, fleet: Ship[]): string {
  switch (result.kind) {
    case 'miss':
      return 'You missed.'
    case 'hit':
      return 'Direct hit!'
    case 'sunk':
      return `You sank the enemy ${shipName(fleet, result.shipId)}!`
    case 'invalid':
      return ''
  }
}

function aiMessage(result: ShotResult, fleet: Ship[]): string {
  switch (result.kind) {
    case 'miss':
      return 'The enemy missed.'
    case 'hit':
      return 'The enemy hit your ship.'
    case 'sunk':
      return `The enemy sank your ${shipName(fleet, result.shipId)}!`
    case 'invalid':
      return ''
  }
}

function animationFor(result: ShotResult): GameState['animating'] {
  if (result.kind === 'invalid') return null
  return { index: toIndex(result.coord), kind: result.kind }
}

function firePlayerShot(state: GameState, coord: Coord): GameState {
  const { board, fleet, result } = applyShot(state.aiBoard, state.aiFleet, coord)
  if (result.kind === 'invalid') return state

  const won = isFleetDestroyed(fleet)
  return {
    ...state,
    phase: won ? 'gameOver' : state.phase,
    winner: won ? 'player' : state.winner,
    aiBoard: board,
    aiFleet: fleet,
    stats: {
      ...state.stats,
      playerShots: state.stats.playerShots + 1,
      playerHits: state.stats.playerHits + (result.kind === 'miss' ? 0 : 1),
    },
    message: won ? 'You win! The enemy fleet is destroyed.' : playerMessage(result, fleet),
    animating: animationFor(result),
  }
}

function fireAIShot(state: GameState, coord: Coord): GameState {
  const { board, fleet, result } = applyShot(state.playerBoard, state.playerFleet, coord)
  if (result.kind === 'invalid') return state

  const lost = isFleetDestroyed(fleet)
  return {
    ...state,
    phase: lost ? 'gameOver' : state.phase,
    winner: lost ? 'ai' : state.winner,
    playerBoard: board,
    playerFleet: fleet,
    ai: { ...state.ai, fired: new Set(state.ai.fired).add(toIndex(coord)) },
    stats: {
      ...state.stats,
      aiShots: state.stats.aiShots + 1,
      aiHits: state.stats.aiHits + (result.kind === 'miss' ? 0 : 1),
    },
    message: lost ? 'The enemy sank your fleet. You lose.' : aiMessage(result, fleet),
    animating: animationFor(result),
  }
}

export function gameReducer(state: GameState, action: Action): GameState {
  switch (action.type) {
    case 'SELECT_SHIP': {
      if (state.phase !== 'placement') return state
      if (state.playerFleet.some((ship) => ship.id === action.shipId)) return state
      return { ...state, selectedShipId: action.shipId }
    }

    case 'ROTATE': {
      if (state.phase !== 'placement') return state
      return { ...state, orientation: state.orientation === 'H' ? 'V' : 'H' }
    }

    case 'PLACE_SHIP': {
      if (state.phase !== 'placement' || state.selectedShipId === null) return state
      const spec = specFor(state.selectedShipId)
      if (!spec) return state
      if (state.playerFleet.some((ship) => ship.id === spec.id)) return state
      if (!canPlace(state.playerBoard, action.origin, spec.length, state.orientation)) return state

      const { board, fleet } = placeShip(
        state.playerBoard,
        state.playerFleet,
        spec,
        action.origin,
        state.orientation,
      )
      return {
        ...state,
        playerBoard: board,
        playerFleet: fleet,
        selectedShipId: firstUnplaced(fleet),
      }
    }

    case 'RANDOMIZE': {
      if (state.phase !== 'placement') return state
      const { board, fleet } = randomFleet()
      return { ...state, playerBoard: board, playerFleet: fleet, selectedShipId: null }
    }

    case 'CLEAR': {
      if (state.phase !== 'placement') return state
      return {
        ...state,
        playerBoard: createBoard(),
        playerFleet: [],
        selectedShipId: FLEET[0].id,
        message: PLACEMENT_MESSAGE,
      }
    }

    case 'SET_DIFFICULTY': {
      if (state.phase !== 'placement') return state
      return { ...state, difficulty: action.difficulty }
    }

    case 'START': {
      if (state.phase !== 'placement' || state.playerFleet.length !== FLEET.length) return state
      return { ...state, phase: 'playerTurn', selectedShipId: null, message: 'Your turn. Fire!' }
    }

    case 'PLAYER_FIRE': {
      if (state.phase !== 'playerTurn' || state.animating !== null) return state
      return firePlayerShot(state, action.coord)
    }

    case 'AI_FIRE': {
      if (state.phase !== 'aiTurn' || state.animating !== null) return state
      return fireAIShot(state, action.coord)
    }

    case 'ANIMATION_DONE': {
      if (state.animating === null) return state
      if (state.phase === 'gameOver') return { ...state, animating: null }
      return {
        ...state,
        animating: null,
        phase: state.phase === 'playerTurn' ? 'aiTurn' : 'playerTurn',
      }
    }

    case 'NEW_GAME':
      return createInitialState(state.difficulty)
  }
}
