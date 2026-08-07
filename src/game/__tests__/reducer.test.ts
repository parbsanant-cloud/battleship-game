import { describe, expect, it } from 'vitest'
import { FLEET, createBoard, toIndex } from '../board.ts'
import { placeShip } from '../placement.ts'
import { createInitialState, gameReducer } from '../reducer.ts'
import type { ShipSpec } from '../board.ts'
import type { Coord, GameState, ShipId } from '../types.ts'

function specFor(id: ShipId): ShipSpec {
  const spec = FLEET.find((candidate) => candidate.id === id)
  if (!spec) throw new Error(`Unknown ship: ${id}`)
  return spec
}

function placementState(): GameState {
  return createInitialState('normal')
}

function readyState(): GameState {
  return gameReducer(placementState(), { type: 'RANDOMIZE' })
}

function startedState(): GameState {
  return gameReducer(readyState(), { type: 'START' })
}

/**
 * A started game reduced to one destroyer per side, so a fleet can be wiped
 * out in two shots: the AI's at (0,0)-(0,1), the player's at (9,8)-(9,9).
 */
function duelState(): GameState {
  const ai = placeShip(createBoard(), [], specFor('destroyer'), { r: 0, c: 0 }, 'H')
  const player = placeShip(createBoard(), [], specFor('destroyer'), { r: 9, c: 8 }, 'H')
  return {
    ...createInitialState('normal'),
    phase: 'playerTurn',
    aiBoard: ai.board,
    aiFleet: ai.fleet,
    playerBoard: player.board,
    playerFleet: player.fleet,
    message: '',
  }
}

/** Fire, then let the animation finish so the turn advances. */
function playerFires(state: GameState, coord: Coord): GameState {
  return gameReducer(gameReducer(state, { type: 'PLAYER_FIRE', coord }), { type: 'ANIMATION_DONE' })
}

function aiFires(state: GameState, coord: Coord): GameState {
  return gameReducer(gameReducer(state, { type: 'AI_FIRE', coord }), { type: 'ANIMATION_DONE' })
}

describe('phase gating', () => {
  it('ignores placement actions once the game has started', () => {
    const started = startedState()
    for (const action of [
      { type: 'ROTATE' },
      { type: 'RANDOMIZE' },
      { type: 'CLEAR' },
      { type: 'START' },
      { type: 'SELECT_SHIP', shipId: 'carrier' },
      { type: 'SET_DIFFICULTY', difficulty: 'easy' },
      { type: 'PLACE_SHIP', origin: { r: 0, c: 0 } },
    ] as const) {
      expect(gameReducer(started, action)).toBe(started)
    }
  })

  it('ignores firing actions during placement', () => {
    const placement = placementState()
    expect(gameReducer(placement, { type: 'PLAYER_FIRE', coord: { r: 0, c: 0 } })).toBe(placement)
    expect(gameReducer(placement, { type: 'AI_FIRE', coord: { r: 0, c: 0 } })).toBe(placement)
    expect(gameReducer(placement, { type: 'ANIMATION_DONE' })).toBe(placement)
  })
})

describe('placement', () => {
  it('selects a ship and toggles orientation', () => {
    const selected = gameReducer(placementState(), { type: 'SELECT_SHIP', shipId: 'cruiser' })
    expect(selected.selectedShipId).toBe('cruiser')

    const rotated = gameReducer(selected, { type: 'ROTATE' })
    expect(rotated.orientation).toBe('V')
    expect(gameReducer(rotated, { type: 'ROTATE' }).orientation).toBe('H')
  })

  it('places the selected ship and advances the selection', () => {
    const state = placementState()
    expect(state.selectedShipId).toBe('carrier')

    const placed = gameReducer(state, { type: 'PLACE_SHIP', origin: { r: 2, c: 3 } })
    expect(placed.playerFleet.map((ship) => ship.id)).toEqual(['carrier'])
    expect(placed.playerBoard.shipAt[toIndex({ r: 2, c: 7 })]).toBe('carrier')
    expect(placed.selectedShipId).toBe('battleship')
  })

  it('ignores an illegal placement and an already-placed ship', () => {
    const placed = gameReducer(placementState(), { type: 'PLACE_SHIP', origin: { r: 2, c: 3 } })

    expect(gameReducer(placed, { type: 'PLACE_SHIP', origin: { r: 0, c: 8 } })).toBe(placed)
    expect(gameReducer(placed, { type: 'SELECT_SHIP', shipId: 'carrier' })).toBe(placed)
  })

  it('randomizes a complete fleet and clears back to empty', () => {
    const randomized = readyState()
    expect(randomized.playerFleet).toHaveLength(FLEET.length)

    const cleared = gameReducer(randomized, { type: 'CLEAR' })
    expect(cleared.playerFleet).toHaveLength(0)
    expect(cleared.playerBoard.cells.every((cell) => cell === 'empty')).toBe(true)
    expect(cleared.selectedShipId).toBe('carrier')
  })

  it('rejects START until all five ships are placed', () => {
    let state = placementState()
    for (const spec of FLEET.slice(0, FLEET.length - 1)) {
      state = gameReducer(state, { type: 'SELECT_SHIP', shipId: spec.id })
      state = gameReducer(state, { type: 'PLACE_SHIP', origin: { r: FLEET.indexOf(spec), c: 0 } })
      expect(gameReducer(state, { type: 'START' })).toBe(state)
    }

    state = gameReducer(state, { type: 'PLACE_SHIP', origin: { r: 4, c: 0 } })
    const started = gameReducer(state, { type: 'START' })
    expect(started.phase).toBe('playerTurn')
    expect(started.selectedShipId).toBeNull()
  })
})

describe('firing', () => {
  it('records a player shot against the AI board and updates stats', () => {
    const fired = gameReducer(duelState(), { type: 'PLAYER_FIRE', coord: { r: 0, c: 0 } })

    expect(fired.aiBoard.cells[toIndex({ r: 0, c: 0 })]).toBe('hit')
    expect(fired.stats).toMatchObject({ playerShots: 1, playerHits: 1 })
    expect(fired.animating).toEqual({ index: 0, kind: 'hit' })
    expect(fired.phase).toBe('playerTurn') // the turn flips on ANIMATION_DONE
  })

  it('counts a miss as a shot but not a hit', () => {
    const fired = gameReducer(duelState(), { type: 'PLAYER_FIRE', coord: { r: 5, c: 5 } })
    expect(fired.stats).toMatchObject({ playerShots: 1, playerHits: 0 })
    expect(fired.animating).toEqual({ index: toIndex({ r: 5, c: 5 }), kind: 'miss' })
  })

  it('ignores a repeated shot at the same cell', () => {
    const state = playerFires(duelState(), { r: 5, c: 5 })
    const back = gameReducer(state, { type: 'ANIMATION_DONE' }) // already cleared
    expect(back).toBe(state)

    const onPlayerTurn = { ...state, phase: 'playerTurn' as const }
    expect(gameReducer(onPlayerTurn, { type: 'PLAYER_FIRE', coord: { r: 5, c: 5 } })).toBe(
      onPlayerTurn,
    )
  })

  it('ignores a player shot while an animation is in progress', () => {
    const animating = gameReducer(duelState(), { type: 'PLAYER_FIRE', coord: { r: 5, c: 5 } })
    expect(animating.animating).not.toBeNull()
    expect(gameReducer(animating, { type: 'PLAYER_FIRE', coord: { r: 6, c: 6 } })).toBe(animating)
  })

  it('ignores a player shot during the AI turn', () => {
    const aiTurn = gameReducer(
      gameReducer(duelState(), { type: 'PLAYER_FIRE', coord: { r: 5, c: 5 } }),
      { type: 'ANIMATION_DONE' },
    )
    expect(aiTurn.phase).toBe('aiTurn')
    expect(gameReducer(aiTurn, { type: 'PLAYER_FIRE', coord: { r: 6, c: 6 } })).toBe(aiTurn)
  })

  it('records an AI shot against the player board and remembers it', () => {
    const aiTurn = { ...duelState(), phase: 'aiTurn' as const }
    const fired = gameReducer(aiTurn, { type: 'AI_FIRE', coord: { r: 9, c: 8 } })

    expect(fired.playerBoard.cells[toIndex({ r: 9, c: 8 })]).toBe('hit')
    expect(fired.stats).toMatchObject({ aiShots: 1, aiHits: 1 })
    expect(fired.ai.fired.has(toIndex({ r: 9, c: 8 }))).toBe(true)
    expect(aiTurn.ai.fired.size).toBe(0) // the original Set is untouched
  })

  it('alternates turns as animations complete', () => {
    let state = duelState()
    expect(state.phase).toBe('playerTurn')

    state = playerFires(state, { r: 5, c: 5 })
    expect(state.phase).toBe('aiTurn')

    state = aiFires(state, { r: 4, c: 4 })
    expect(state.phase).toBe('playerTurn')

    state = playerFires(state, { r: 5, c: 6 })
    expect(state.phase).toBe('aiTurn')
  })
})

describe('game over', () => {
  it('ends the game the moment the last enemy ship sinks', () => {
    const afterFirst = playerFires(duelState(), { r: 0, c: 0 })
    const won = gameReducer(
      { ...afterFirst, phase: 'playerTurn' },
      { type: 'PLAYER_FIRE', coord: { r: 0, c: 1 } },
    )

    expect(won.phase).toBe('gameOver')
    expect(won.winner).toBe('player')
    expect(won.animating).toEqual({ index: 1, kind: 'sunk' })

    // ANIMATION_DONE clears the animation without handing the AI a turn.
    const settled = gameReducer(won, { type: 'ANIMATION_DONE' })
    expect(settled.phase).toBe('gameOver')
    expect(settled.animating).toBeNull()
  })

  it('ends the game when the AI sinks the last player ship', () => {
    const aiTurn = { ...duelState(), phase: 'aiTurn' as const }
    const afterFirst = aiFires(aiTurn, { r: 9, c: 8 })
    const lost = gameReducer(
      { ...afterFirst, phase: 'aiTurn' },
      { type: 'AI_FIRE', coord: { r: 9, c: 9 } },
    )

    expect(lost.phase).toBe('gameOver')
    expect(lost.winner).toBe('ai')
  })

  it('ignores further shots once the game is over', () => {
    const afterFirst = playerFires(duelState(), { r: 0, c: 0 })
    const won = gameReducer(
      { ...afterFirst, phase: 'playerTurn' },
      { type: 'PLAYER_FIRE', coord: { r: 0, c: 1 } },
    )
    const settled = gameReducer(won, { type: 'ANIMATION_DONE' })

    expect(gameReducer(settled, { type: 'PLAYER_FIRE', coord: { r: 5, c: 5 } })).toBe(settled)
    expect(gameReducer(settled, { type: 'AI_FIRE', coord: { r: 5, c: 5 } })).toBe(settled)
  })
})

describe('NEW_GAME', () => {
  it('resets every part of the game but keeps the difficulty', () => {
    const easy = gameReducer(readyState(), { type: 'SET_DIFFICULTY', difficulty: 'easy' })
    let state = gameReducer(easy, { type: 'START' })
    state = playerFires(state, { r: 0, c: 0 })
    state = aiFires(state, { r: 1, c: 1 })

    const reset = gameReducer(state, { type: 'NEW_GAME' })

    expect(reset.phase).toBe('placement')
    expect(reset.difficulty).toBe('easy')
    expect(reset.playerFleet).toEqual([])
    expect(reset.playerBoard.cells.every((cell) => cell === 'empty')).toBe(true)
    expect(reset.aiFleet).toHaveLength(FLEET.length)
    expect(reset.aiBoard.cells.filter((cell) => cell !== 'empty' && cell !== 'ship')).toEqual([])
    expect(reset.ai.fired.size).toBe(0)
    expect(reset.ai.hits).toEqual([])
    expect(reset.ai.sunk).toEqual([])
    expect(reset.stats).toEqual({ playerShots: 0, playerHits: 0, aiShots: 0, aiHits: 0 })
    expect(reset.animating).toBeNull()
    expect(reset.winner).toBeNull()
    expect(reset.selectedShipId).toBe('carrier')
    expect(reset.message).not.toBe(state.message)
  })
})

describe('immutability', () => {
  it('never mutates the state it was given', () => {
    const state = duelState()
    const snapshot = structuredClone({
      phase: state.phase,
      aiBoard: state.aiBoard,
      playerBoard: state.playerBoard,
      aiFleet: state.aiFleet,
      playerFleet: state.playerFleet,
      stats: state.stats,
      firedSize: state.ai.fired.size,
    })

    gameReducer(state, { type: 'PLAYER_FIRE', coord: { r: 0, c: 0 } })
    gameReducer({ ...state, phase: 'aiTurn' }, { type: 'AI_FIRE', coord: { r: 9, c: 8 } })
    gameReducer(state, { type: 'NEW_GAME' })

    expect(state.phase).toBe(snapshot.phase)
    expect(state.aiBoard).toEqual(snapshot.aiBoard)
    expect(state.playerBoard).toEqual(snapshot.playerBoard)
    expect(state.aiFleet).toEqual(snapshot.aiFleet)
    expect(state.playerFleet).toEqual(snapshot.playerFleet)
    expect(state.stats).toEqual(snapshot.stats)
    expect(state.ai.fired.size).toBe(snapshot.firedSize)
  })
})
