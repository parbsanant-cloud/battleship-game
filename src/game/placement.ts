import { BOARD_SIZE, FLEET, type ShipSpec, createBoard, inBounds, toIndex } from './board.ts'
import type { Board, Coord, Orientation, Ship } from './types.ts'

const MAX_ORIGIN_ATTEMPTS = 200
const MAX_FLEET_ATTEMPTS = 10

export class PlacementError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'PlacementError'
  }
}

export interface PlacementResult {
  board: Board
  fleet: Ship[]
}

/** Raw footprint from `origin`, unfiltered — may contain out-of-bounds cells. */
export function shipCells(origin: Coord, length: number, orientation: Orientation): Coord[] {
  return Array.from({ length }, (_, offset) =>
    orientation === 'H'
      ? { r: origin.r, c: origin.c + offset }
      : { r: origin.r + offset, c: origin.c },
  )
}

/** Ships may touch but may not overlap. */
export function canPlace(
  board: Board,
  origin: Coord,
  length: number,
  orientation: Orientation,
): boolean {
  return shipCells(origin, length, orientation).every(
    (cell) => inBounds(cell) && board.shipAt[toIndex(cell)] === null,
  )
}

export function placeShip(
  board: Board,
  fleet: Ship[],
  spec: ShipSpec,
  origin: Coord,
  orientation: Orientation,
): PlacementResult {
  if (fleet.some((ship) => ship.id === spec.id)) {
    throw new PlacementError(`${spec.name} is already placed`)
  }
  if (!canPlace(board, origin, spec.length, orientation)) {
    throw new PlacementError(`Cannot place ${spec.name} at (${origin.r}, ${origin.c})`)
  }

  const cells = shipCells(origin, spec.length, orientation)
  const next: Board = { cells: [...board.cells], shipAt: [...board.shipAt] }
  for (const cell of cells) {
    const index = toIndex(cell)
    next.cells[index] = 'ship'
    next.shipAt[index] = spec.id
  }

  return {
    board: next,
    fleet: [...fleet, { id: spec.id, name: spec.name, length: spec.length, cells, hits: 0 }],
  }
}

function randomOrigin(): Coord {
  return {
    r: Math.floor(Math.random() * BOARD_SIZE),
    c: Math.floor(Math.random() * BOARD_SIZE),
  }
}

function randomOrientation(): Orientation {
  return Math.random() < 0.5 ? 'H' : 'V'
}

function tryRandomFleet(): PlacementResult | null {
  let result: PlacementResult = { board: createBoard(), fleet: [] }

  for (const spec of [...FLEET].sort((a, b) => b.length - a.length)) {
    let placed = false
    for (let attempt = 0; attempt < MAX_ORIGIN_ATTEMPTS && !placed; attempt++) {
      const origin = randomOrigin()
      const orientation = randomOrientation()
      if (canPlace(result.board, origin, spec.length, orientation)) {
        result = placeShip(result.board, result.fleet, spec, origin, orientation)
        placed = true
      }
    }
    if (!placed) return null
  }

  return result
}

export function randomFleet(): PlacementResult {
  for (let attempt = 0; attempt < MAX_FLEET_ATTEMPTS; attempt++) {
    const result = tryRandomFleet()
    if (result) return result
  }
  throw new PlacementError(`Random placement failed after ${MAX_FLEET_ATTEMPTS} attempts`)
}
