import { updateAIMemory } from './ai.ts'
import { FLEET, createBoard, toIndex, type ShipSpec } from './board.ts'
import { canPlace, placeShip, randomFleet } from './placement.ts'
import { applyShot, isFleetDestroyed, type ShotResult } from './rules.ts'
import type { Action, Coord, GameState, Ship, ShipId } from './types.ts'

const PLACEMENT_MESSAGE = 'Place your fleet, then start the game.'
const MAX_LOG_ENTRIES = 8

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
    ai: { fired: new Set(), hits: [], sunk: [] },
    selectedShipId: FLEET[0].id,
    orientation: 'H',
    message: PLACEMENT_MESSAGE,
    stats: { playerShots: 0, playerHits: 0, aiShots: 0, aiHits: 0 },
    battleLog: [],
    nextLogId: 0,
    toast: null,
    animating: null,
    winner: null,
  }
}

function addLogEntry(state: GameState, message: string): GameState {
  const entry = { id: state.nextLogId, message }
  return {
    ...state,
    battleLog: [entry, ...state.battleLog].slice(0, MAX_LOG_ENTRIES),
    nextLogId: state.nextLogId + 1,
  }
}

function shipName(fleet: Ship[], id: ShipId): string {
  const ship = fleet.find((candidate) => candidate.id === id)
  return ship ? ship.name : id
}

function playerMessage(result: ShotResult, fleet: Ship[]): string {
  switch (result.kind) {
    case 'miss':
      return 'Splash. No contact.'
    case 'hit':
      return 'Direct hit.'
    case 'sunk':
      return `Enemy ${shipName(fleet, result.shipId)} neutralized.`
    case 'invalid':
      return ''
  }
}

function aiMessage(result: ShotResult, fleet: Ship[]): string {
  switch (result.kind) {
    case 'miss':
      return 'Enemy fire missed.'
    case 'hit':
      return "Incoming fire — we've been hit."
    case 'sunk':
      return `Our ${shipName(fleet, result.shipId)} has been lost.`
    case 'invalid':
      return ''
  }
}

function playerToast(result: ShotResult, fleet: Ship[]): string | null {
  return result.kind === 'sunk' ? `Enemy ${shipName(fleet, result.shipId)} neutralized.` : null
}

function aiToast(result: ShotResult, fleet: Ship[]): string | null {
  return result.kind === 'sunk' ? `Our ${shipName(fleet, result.shipId)} has been lost.` : null
}

function animationFor(result: ShotResult): GameState['animating'] {
  if (result.kind === 'invalid') return null
  return { index: toIndex(result.coord), kind: result.kind }
}

function firePlayerShot(state: GameState, coord: Coord): GameState {
  const { board, fleet, result } = applyShot(state.aiBoard, state.aiFleet, coord)
  if (result.kind === 'invalid') return state

  const won = isFleetDestroyed(fleet)
  const shotMessage = playerMessage(result, fleet)
  const toastMessage = playerToast(result, fleet)
  const gameMessage = 'Mission accomplished. Enemy fleet neutralized.'
  const next = {
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
    message: won ? gameMessage : shotMessage,
    toast: toastMessage ? { id: state.nextLogId, message: toastMessage } : state.toast,
    animating: animationFor(result),
  }
  const withShot = addLogEntry(next, shotMessage)
  return won ? addLogEntry({ ...withShot, message: gameMessage }, gameMessage) : withShot
}

function fireAIShot(state: GameState, coord: Coord): GameState {
  const { board, fleet, result } = applyShot(state.playerBoard, state.playerFleet, coord)
  if (result.kind === 'invalid') return state

  const lost = isFleetDestroyed(fleet)
  const shotMessage = aiMessage(result, fleet)
  const toastMessage = aiToast(result, fleet)
  const gameMessage = 'Mission failed. Our fleet has been destroyed.'
  const next = {
    ...state,
    phase: lost ? 'gameOver' : state.phase,
    winner: lost ? 'ai' : state.winner,
    playerBoard: board,
    playerFleet: fleet,
    ai: updateAIMemory(state.ai, coord, result),
    stats: {
      ...state.stats,
      aiShots: state.stats.aiShots + 1,
      aiHits: state.stats.aiHits + (result.kind === 'miss' ? 0 : 1),
    },
    message: lost ? gameMessage : shotMessage,
    toast: toastMessage ? { id: state.nextLogId, message: toastMessage } : state.toast,
    animating: animationFor(result),
  }
  const withShot = addLogEntry(next, shotMessage)
  return lost ? addLogEntry({ ...withShot, message: gameMessage }, gameMessage) : withShot
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

    case 'DISMISS_TOAST':
      return state.toast === null ? state : { ...state, toast: null }

    case 'NEW_GAME':
      return createInitialState(state.difficulty)
  }
}
