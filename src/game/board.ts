import type { Board, Coord, ShipId } from './types.ts'

export const BOARD_SIZE = 10
export const CELL_COUNT = BOARD_SIZE * BOARD_SIZE

export interface ShipSpec {
  id: ShipId
  name: string
  length: number
}

export const FLEET: readonly ShipSpec[] = [
  { id: 'carrier', name: 'Carrier', length: 5 },
  { id: 'battleship', name: 'Battleship', length: 4 },
  { id: 'cruiser', name: 'Cruiser', length: 3 },
  { id: 'submarine', name: 'Submarine', length: 3 },
  { id: 'destroyer', name: 'Destroyer', length: 2 },
]

export const TOTAL_SHIP_CELLS = FLEET.reduce((sum, spec) => sum + spec.length, 0)

export function toIndex({ r, c }: Coord): number {
  return r * BOARD_SIZE + c
}

export function toCoord(index: number): Coord {
  return { r: Math.floor(index / BOARD_SIZE), c: index % BOARD_SIZE }
}

/** Checks row and column separately so a ship can never wrap onto the next row. */
export function inBounds({ r, c }: Coord): boolean {
  return r >= 0 && r < BOARD_SIZE && c >= 0 && c < BOARD_SIZE
}

export function createBoard(): Board {
  return {
    cells: Array.from({ length: CELL_COUNT }, () => 'empty'),
    shipAt: Array.from({ length: CELL_COUNT }, () => null),
  }
}

export function neighbours({ r, c }: Coord): Coord[] {
  return [
    { r: r - 1, c },
    { r: r + 1, c },
    { r, c: c - 1 },
    { r, c: c + 1 },
  ].filter(inBounds)
}
