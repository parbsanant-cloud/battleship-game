import { inBounds, toIndex } from './board.ts'
import type { Board, Coord, Ship, ShipId } from './types.ts'

export type ShotResult =
  | { kind: 'invalid' }
  | { kind: 'miss'; coord: Coord }
  | { kind: 'hit'; coord: Coord; shipId: ShipId }
  | { kind: 'sunk'; coord: Coord; shipId: ShipId; shipCells: Coord[] }

export interface ShotOutcome {
  board: Board
  fleet: Ship[]
  result: ShotResult
}

const INVALID = { kind: 'invalid' } as const

/**
 * Resolves a shot against `board`. Out-of-bounds and already-fired coordinates
 * are rejected before any state is read or changed, and return the original
 * board and fleet references.
 */
export function applyShot(board: Board, fleet: Ship[], coord: Coord): ShotOutcome {
  if (!inBounds(coord)) return { board, fleet, result: INVALID }

  const index = toIndex(coord)
  const cell = board.cells[index]
  if (cell === 'hit' || cell === 'miss' || cell === 'sunk') {
    return { board, fleet, result: INVALID }
  }

  const shipId = board.shipAt[index]
  const nextBoard: Board = { cells: [...board.cells], shipAt: [...board.shipAt] }

  if (shipId === null) {
    nextBoard.cells[index] = 'miss'
    return { board: nextBoard, fleet, result: { kind: 'miss', coord } }
  }

  const nextFleet = fleet.map((ship) =>
    ship.id === shipId ? { ...ship, hits: ship.hits + 1 } : ship,
  )
  const struck = nextFleet.find((ship) => ship.id === shipId)
  if (!struck) throw new Error(`Board references ship ${shipId}, which is not in the fleet`)

  if (struck.hits < struck.length) {
    nextBoard.cells[index] = 'hit'
    return { board: nextBoard, fleet: nextFleet, result: { kind: 'hit', coord, shipId } }
  }

  for (const shipCell of struck.cells) {
    nextBoard.cells[toIndex(shipCell)] = 'sunk'
  }
  return {
    board: nextBoard,
    fleet: nextFleet,
    result: { kind: 'sunk', coord, shipId, shipCells: struck.cells },
  }
}

/** An empty fleet is not destroyed — nothing was ever afloat to sink. */
export function isFleetDestroyed(fleet: Ship[]): boolean {
  return fleet.length > 0 && fleet.every((ship) => ship.hits === ship.length)
}
