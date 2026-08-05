import { describe, expect, it } from 'vitest'
import {
  BOARD_SIZE,
  CELL_COUNT,
  FLEET,
  TOTAL_SHIP_CELLS,
  createBoard,
  inBounds,
  neighbours,
  toCoord,
  toIndex,
} from '../board.ts'

describe('FLEET', () => {
  it('is the standard 5-ship fleet of 17 cells', () => {
    expect(FLEET.map((s) => [s.id, s.length])).toEqual([
      ['carrier', 5],
      ['battleship', 4],
      ['cruiser', 3],
      ['submarine', 3],
      ['destroyer', 2],
    ])
    expect(TOTAL_SHIP_CELLS).toBe(17)
  })

  it('has unique ship ids', () => {
    expect(new Set(FLEET.map((s) => s.id)).size).toBe(FLEET.length)
  })
})

describe('toIndex / toCoord', () => {
  it('maps coordinates with row * 10 + column', () => {
    expect(toIndex({ r: 0, c: 0 })).toBe(0)
    expect(toIndex({ r: 0, c: 9 })).toBe(9)
    expect(toIndex({ r: 3, c: 4 })).toBe(34)
    expect(toIndex({ r: 9, c: 9 })).toBe(CELL_COUNT - 1)
  })

  it('round-trips every cell on the board', () => {
    for (let index = 0; index < CELL_COUNT; index++) {
      expect(toIndex(toCoord(index))).toBe(index)
    }
  })
})

describe('inBounds', () => {
  it('accepts every corner', () => {
    const last = BOARD_SIZE - 1
    for (const coord of [
      { r: 0, c: 0 },
      { r: 0, c: last },
      { r: last, c: 0 },
      { r: last, c: last },
    ]) {
      expect(inBounds(coord)).toBe(true)
    }
  })

  it('rejects negative and overflowing rows and columns', () => {
    for (const coord of [
      { r: -1, c: 0 },
      { r: 0, c: -1 },
      { r: BOARD_SIZE, c: 0 },
      { r: 0, c: BOARD_SIZE },
    ]) {
      expect(inBounds(coord)).toBe(false)
    }
  })
})

describe('createBoard', () => {
  it('creates a fully empty board of CELL_COUNT cells', () => {
    const board = createBoard()
    expect(board.cells).toHaveLength(CELL_COUNT)
    expect(board.shipAt).toHaveLength(CELL_COUNT)
    expect(board.cells.every((cell) => cell === 'empty')).toBe(true)
    expect(board.shipAt.every((ship) => ship === null)).toBe(true)
  })

  it('returns independent boards', () => {
    const a = createBoard()
    const b = createBoard()
    a.cells[0] = 'hit'
    expect(b.cells[0]).toBe('empty')
  })
})

describe('neighbours', () => {
  it('returns the four orthogonal cells in the middle of the board', () => {
    expect(neighbours({ r: 5, c: 5 })).toEqual([
      { r: 4, c: 5 },
      { r: 6, c: 5 },
      { r: 5, c: 4 },
      { r: 5, c: 6 },
    ])
  })

  it('clips at corners and edges', () => {
    expect(neighbours({ r: 0, c: 0 })).toEqual([
      { r: 1, c: 0 },
      { r: 0, c: 1 },
    ])
    expect(neighbours({ r: 9, c: 9 })).toHaveLength(2)
    expect(neighbours({ r: 0, c: 4 })).toHaveLength(3)
  })

  it('never returns an out-of-bounds cell', () => {
    for (let index = 0; index < CELL_COUNT; index++) {
      expect(neighbours(toCoord(index)).every(inBounds)).toBe(true)
    }
  })
})
