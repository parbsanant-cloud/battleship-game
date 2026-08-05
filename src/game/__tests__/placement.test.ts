import { describe, expect, it } from 'vitest'
import { CELL_COUNT, FLEET, TOTAL_SHIP_CELLS, createBoard, inBounds, toIndex } from '../board.ts'
import {
  PlacementError,
  type PlacementResult,
  canPlace,
  placeShip,
  randomFleet,
  shipCells,
} from '../placement.ts'
import type { ShipSpec } from '../board.ts'
import type { Board, Coord, Orientation, ShipId } from '../types.ts'

function specFor(id: ShipId): ShipSpec {
  const spec = FLEET.find((candidate) => candidate.id === id)
  if (!spec) throw new Error(`Unknown ship: ${id}`)
  return spec
}

const carrier = specFor('carrier')
const destroyer = specFor('destroyer')

function place(
  board: Board,
  spec: ShipSpec,
  origin: Coord,
  orientation: Orientation,
): PlacementResult {
  return placeShip(board, [], spec, origin, orientation)
}

describe('canPlace', () => {
  it('accepts a horizontal and a vertical placement that fit', () => {
    const board = createBoard()
    expect(canPlace(board, { r: 0, c: 0 }, 5, 'H')).toBe(true)
    expect(canPlace(board, { r: 0, c: 0 }, 5, 'V')).toBe(true)
    expect(canPlace(board, { r: 5, c: 5 }, 5, 'H')).toBe(true)
    expect(canPlace(board, { r: 5, c: 5 }, 5, 'V')).toBe(true)
  })

  it('rejects overlapping ships but allows touching ones', () => {
    const { board } = place(createBoard(), carrier, { r: 4, c: 2 }, 'H')

    expect(canPlace(board, { r: 4, c: 6 }, 2, 'H')).toBe(false) // shares (4,6)
    expect(canPlace(board, { r: 2, c: 4 }, 3, 'V')).toBe(false) // crosses (4,4)

    expect(canPlace(board, { r: 4, c: 7 }, 2, 'H')).toBe(true) // end to end
    expect(canPlace(board, { r: 5, c: 2 }, 5, 'H')).toBe(true) // directly below
    expect(canPlace(board, { r: 1, c: 2 }, 3, 'V')).toBe(true) // ends at (3,2)
  })

  it('rejects placements running past every edge', () => {
    const board = createBoard()
    expect(canPlace(board, { r: 0, c: 6 }, 5, 'H')).toBe(false) // past the right edge
    expect(canPlace(board, { r: 6, c: 0 }, 5, 'V')).toBe(false) // past the bottom edge
    expect(canPlace(board, { r: 0, c: -1 }, 5, 'H')).toBe(false) // past the left edge
    expect(canPlace(board, { r: -1, c: 0 }, 5, 'V')).toBe(false) // past the top edge
  })

  it('rejects a horizontal ship that would wrap onto the next row', () => {
    const board = createBoard()
    // (0,8) + length 4 = flat indices 8..11, all < CELL_COUNT, but 10 and 11 are row 1.
    expect(canPlace(board, { r: 0, c: 8 }, 4, 'H')).toBe(false)
    expect(shipCells({ r: 0, c: 8 }, 4, 'H').filter(inBounds)).toHaveLength(2)
  })
})

describe('placeShip', () => {
  it('writes the ship onto the board and into the fleet', () => {
    const { board, fleet } = place(createBoard(), carrier, { r: 2, c: 3 }, 'H')
    const cells = [
      { r: 2, c: 3 },
      { r: 2, c: 4 },
      { r: 2, c: 5 },
      { r: 2, c: 6 },
      { r: 2, c: 7 },
    ]

    for (const cell of cells) {
      expect(board.cells[toIndex(cell)]).toBe('ship')
      expect(board.shipAt[toIndex(cell)]).toBe('carrier')
    }
    expect(board.cells.filter((cell) => cell === 'ship')).toHaveLength(carrier.length)

    expect(fleet).toHaveLength(1)
    expect(fleet[0]).toEqual({
      id: 'carrier',
      name: 'Carrier',
      length: 5,
      cells,
      hits: 0,
    })
  })

  it('places vertically down a column', () => {
    const { board } = place(createBoard(), destroyer, { r: 8, c: 9 }, 'V')
    expect(board.shipAt[toIndex({ r: 8, c: 9 })]).toBe('destroyer')
    expect(board.shipAt[toIndex({ r: 9, c: 9 })]).toBe('destroyer')
  })

  it('does not mutate the board or fleet it was given', () => {
    const board = createBoard()
    const fleet = place(board, carrier, { r: 0, c: 0 }, 'H').fleet

    expect(board.cells.every((cell) => cell === 'empty')).toBe(true)
    expect(board.shipAt.every((ship) => ship === null)).toBe(true)

    const second = placeShip(createBoard(), fleet, destroyer, { r: 5, c: 5 }, 'H')
    expect(fleet).toHaveLength(1)
    expect(second.fleet).toHaveLength(2)
  })

  it('throws on an illegal placement or a ship that is already placed', () => {
    const { board, fleet } = place(createBoard(), carrier, { r: 0, c: 0 }, 'H')

    expect(() => placeShip(board, fleet, destroyer, { r: 0, c: 0 }, 'H')).toThrow(PlacementError)
    expect(() => placeShip(board, fleet, destroyer, { r: 0, c: 9 }, 'H')).toThrow(PlacementError)
    expect(() => placeShip(board, fleet, carrier, { r: 5, c: 0 }, 'H')).toThrow(PlacementError)
  })
})

describe('randomFleet', () => {
  it('produces a legal standard fleet on every run', () => {
    for (let run = 0; run < 200; run++) {
      const { board, fleet } = randomFleet()

      expect(fleet).toHaveLength(FLEET.length)
      expect([...fleet].map((ship) => ship.length).sort()).toEqual(
        [...FLEET].map((spec) => spec.length).sort(),
      )
      expect(new Set(fleet.map((ship) => ship.id))).toEqual(new Set(FLEET.map((spec) => spec.id)))

      const occupied = board.shipAt.filter((ship) => ship !== null)
      expect(occupied).toHaveLength(TOTAL_SHIP_CELLS)
      expect(board.cells.filter((cell) => cell === 'ship')).toHaveLength(TOTAL_SHIP_CELLS)

      const indices = fleet.flatMap((ship) => ship.cells).map(toIndex)
      expect(new Set(indices).size).toBe(TOTAL_SHIP_CELLS) // no overlaps
      for (const ship of fleet) {
        expect(ship.cells).toHaveLength(ship.length)
        expect(ship.cells.every(inBounds)).toBe(true)
        expect(ship.cells.every((cell) => board.shipAt[toIndex(cell)] === ship.id)).toBe(true)
      }
      expect(indices.every((index) => index >= 0 && index < CELL_COUNT)).toBe(true)
    }
  })

  it('returns an independent board each run', () => {
    const first = randomFleet()
    const second = randomFleet()
    expect(first.board).not.toBe(second.board)
  })
})
