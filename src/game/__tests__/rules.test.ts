import { describe, expect, it } from 'vitest'
import { BOARD_SIZE, FLEET, TOTAL_SHIP_CELLS, createBoard, toIndex } from '../board.ts'
import { placeShip, randomFleet } from '../placement.ts'
import { applyShot, isFleetDestroyed } from '../rules.ts'
import type { ShipSpec } from '../board.ts'
import type { Board, Coord, Ship, ShipId } from '../types.ts'

function specFor(id: ShipId): ShipSpec {
  const spec = FLEET.find((candidate) => candidate.id === id)
  if (!spec) throw new Error(`Unknown ship: ${id}`)
  return spec
}

function shipIn(fleet: Ship[], id: ShipId): Ship {
  const ship = fleet.find((candidate) => candidate.id === id)
  if (!ship) throw new Error(`Ship not in fleet: ${id}`)
  return ship
}

/** Destroyer at (0,0)-(0,1) horizontal, cruiser at (5,5)-(7,5) vertical. */
function twoShipSetup(): { board: Board; fleet: Ship[] } {
  const first = placeShip(createBoard(), [], specFor('destroyer'), { r: 0, c: 0 }, 'H')
  return placeShip(first.board, first.fleet, specFor('cruiser'), { r: 5, c: 5 }, 'V')
}

function fireAll(board: Board, fleet: Ship[], coords: Coord[]): { board: Board; fleet: Ship[] } {
  let state = { board, fleet }
  for (const coord of coords) {
    const outcome = applyShot(state.board, state.fleet, coord)
    state = { board: outcome.board, fleet: outcome.fleet }
  }
  return state
}

describe('applyShot', () => {
  it('returns miss on empty water and marks the cell', () => {
    const { board, fleet } = twoShipSetup()
    const outcome = applyShot(board, fleet, { r: 9, c: 9 })

    expect(outcome.result).toEqual({ kind: 'miss', coord: { r: 9, c: 9 } })
    expect(outcome.board.cells[toIndex({ r: 9, c: 9 })]).toBe('miss')
    expect(outcome.fleet).toBe(fleet)
  })

  it('returns hit on a ship and increments only that ship', () => {
    const { board, fleet } = twoShipSetup()
    const outcome = applyShot(board, fleet, { r: 5, c: 5 })

    expect(outcome.result).toEqual({ kind: 'hit', coord: { r: 5, c: 5 }, shipId: 'cruiser' })
    expect(outcome.board.cells[toIndex({ r: 5, c: 5 })]).toBe('hit')
    expect(shipIn(outcome.fleet, 'cruiser').hits).toBe(1)
    expect(shipIn(outcome.fleet, 'destroyer').hits).toBe(0)
  })

  it('returns invalid for a repeated shot, on both a hit and a miss', () => {
    const { board, fleet } = twoShipSetup()

    const afterMiss = applyShot(board, fleet, { r: 9, c: 9 })
    const repeatMiss = applyShot(afterMiss.board, afterMiss.fleet, { r: 9, c: 9 })
    expect(repeatMiss.result).toEqual({ kind: 'invalid' })
    expect(repeatMiss.board).toBe(afterMiss.board)
    expect(repeatMiss.fleet).toBe(afterMiss.fleet)

    const afterHit = applyShot(board, fleet, { r: 5, c: 5 })
    const repeatHit = applyShot(afterHit.board, afterHit.fleet, { r: 5, c: 5 })
    expect(repeatHit.result).toEqual({ kind: 'invalid' })
    expect(repeatHit.board).toBe(afterHit.board)
  })

  it('does not increment hits on a repeated shot', () => {
    const { board, fleet } = twoShipSetup()
    const afterHit = applyShot(board, fleet, { r: 5, c: 5 })
    const repeat = applyShot(afterHit.board, afterHit.fleet, { r: 5, c: 5 })

    expect(shipIn(repeat.fleet, 'cruiser').hits).toBe(1)
  })

  it('returns invalid for a shot on an already-sunk cell', () => {
    const { board, fleet } = twoShipSetup()
    const sunk = fireAll(board, fleet, [
      { r: 0, c: 0 },
      { r: 0, c: 1 },
    ])

    expect(applyShot(sunk.board, sunk.fleet, { r: 0, c: 0 }).result).toEqual({ kind: 'invalid' })
    expect(shipIn(sunk.fleet, 'destroyer').hits).toBe(2)
  })

  it('returns sunk on the final hit and marks every cell of that ship', () => {
    const { board, fleet } = twoShipSetup()
    const cruiserCells = [
      { r: 5, c: 5 },
      { r: 6, c: 5 },
      { r: 7, c: 5 },
    ]

    const partial = fireAll(board, fleet, cruiserCells.slice(0, 2))
    expect(partial.board.cells[toIndex(cruiserCells[0])]).toBe('hit')

    const final = applyShot(partial.board, partial.fleet, cruiserCells[2])
    expect(final.result).toEqual({
      kind: 'sunk',
      coord: cruiserCells[2],
      shipId: 'cruiser',
      shipCells: cruiserCells,
    })
    for (const cell of cruiserCells) {
      expect(final.board.cells[toIndex(cell)]).toBe('sunk')
    }
  })

  it('leaves other ships and untouched cells alone', () => {
    const { board, fleet } = twoShipSetup()
    const final = fireAll(board, fleet, [
      { r: 5, c: 5 },
      { r: 6, c: 5 },
      { r: 7, c: 5 },
    ])

    expect(shipIn(final.fleet, 'destroyer').hits).toBe(0)
    expect(final.board.cells[toIndex({ r: 0, c: 0 })]).toBe('ship')
    expect(final.board.cells[toIndex({ r: 0, c: 1 })]).toBe('ship')
    expect(final.board.shipAt).toEqual(board.shipAt)
    expect(final.board.cells.filter((cell) => cell === 'sunk')).toHaveLength(3)
  })

  it('does not mutate the board or fleet it was given', () => {
    const { board, fleet } = twoShipSetup()
    const cellsBefore = [...board.cells]
    const hitsBefore = fleet.map((ship) => ship.hits)

    applyShot(board, fleet, { r: 5, c: 5 })
    applyShot(board, fleet, { r: 9, c: 9 })

    expect(board.cells).toEqual(cellsBefore)
    expect(fleet.map((ship) => ship.hits)).toEqual(hitsBefore)
  })

  it('treats out-of-bounds coordinates as invalid without touching state', () => {
    const { board, fleet } = twoShipSetup()
    for (const coord of [
      { r: -1, c: 0 },
      { r: 0, c: -1 },
      { r: BOARD_SIZE, c: 0 },
      { r: 0, c: BOARD_SIZE },
    ]) {
      const outcome = applyShot(board, fleet, coord)
      expect(outcome.result).toEqual({ kind: 'invalid' })
      expect(outcome.board).toBe(board)
      expect(outcome.fleet).toBe(fleet)
    }
  })
})

describe('isFleetDestroyed', () => {
  it('is false until the last of all 17 ship cells is hit', () => {
    const start = randomFleet()
    const targets = start.fleet.flatMap((ship) => ship.cells)
    expect(targets).toHaveLength(TOTAL_SHIP_CELLS)

    let state = { board: start.board, fleet: start.fleet }
    for (let shot = 0; shot < targets.length - 1; shot++) {
      const outcome = applyShot(state.board, state.fleet, targets[shot])
      state = { board: outcome.board, fleet: outcome.fleet }
      expect(isFleetDestroyed(state.fleet)).toBe(false)
    }

    const last = applyShot(state.board, state.fleet, targets[targets.length - 1])
    expect(isFleetDestroyed(last.fleet)).toBe(true)
  })

  it('is false for an empty fleet', () => {
    expect(isFleetDestroyed([])).toBe(false)
  })
})
