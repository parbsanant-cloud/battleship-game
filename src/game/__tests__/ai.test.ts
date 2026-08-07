import { describe, expect, it, vi } from 'vitest'
import { chooseAIShot, updateAIMemory } from '../ai.ts'
import { CELL_COUNT, inBounds, neighbours, toCoord, toIndex } from '../board.ts'
import { randomFleet } from '../placement.ts'
import { applyShot, isFleetDestroyed } from '../rules.ts'
import type { AIMemory, Coord, ShipId } from '../types.ts'

function memory(fired: Coord[] = [], hits: Coord[] = [], sunk: ShipId[] = []): AIMemory {
  return {
    fired: new Set(fired.map(toIndex)),
    hits: [...hits],
    sunk: [...sunk],
  }
}

function memoryWithUnfired(unfired: Coord[], sunk: ShipId[] = []): AIMemory {
  const open = new Set(unfired.map(toIndex))
  const fired = Array.from({ length: CELL_COUNT }, (_, index) => index)
    .filter((index) => !open.has(index))
    .map(toCoord)
  return memory(fired, [], sunk)
}

function expectValidShot(coord: Coord, state: AIMemory): void {
  expect(inBounds(coord)).toBe(true)
  expect(state.fired.has(toIndex(coord))).toBe(false)
}

describe('chooseAIShot', () => {
  it('chooses easy shots from unfired in-bounds cells', () => {
    const state = memory(
      Array.from({ length: 50 }, (_, index) => ({ r: Math.floor(index / 10), c: index % 10 })),
    )
    for (let attempt = 0; attempt < 100; attempt++) {
      expectValidShot(chooseAIShot(state, 'easy'), state)
    }
  })

  it('hunts when normal mode has no hits', () => {
    const state = memory([{ r: 0, c: 0 }])
    expectValidShot(chooseAIShot(state, 'normal'), state)
  })

  it('targets unfired orthogonal neighbors after one hit', () => {
    const hit = { r: 5, c: 5 }
    const state = memory([hit], [hit])
    const candidates = new Set(neighbours(hit).map(toIndex))
    for (let attempt = 0; attempt < 100; attempt++) {
      const shot = chooseAIShot(state, 'normal')
      expect(candidates.has(toIndex(shot))).toBe(true)
    }
  })

  it('targets the open ends of two aligned hits', () => {
    const hits = [{ r: 5, c: 5 }, { r: 5, c: 6 }]
    const state = memory(hits, hits)
    const shotIndices = new Set([toIndex({ r: 5, c: 4 }), toIndex({ r: 5, c: 7 })])
    for (let attempt = 0; attempt < 100; attempt++) {
      const shot = chooseAIShot(state, 'normal')
      expect(shot.r).toBe(5)
      expect(shotIndices.has(toIndex(shot))).toBe(true)
    }
  })

  it('prioritizes an interior gap over open ends', () => {
    const hits = [{ r: 5, c: 5 }, { r: 5, c: 7 }]
    const state = memory(hits, hits)
    const random = vi.spyOn(Math, 'random').mockReturnValue(0)

    expect(chooseAIShot(state, 'normal')).toEqual({ r: 5, c: 6 })

    random.mockRestore()
  })

  it('skips blocked or already-fired line ends', () => {
    const hits = [{ r: 5, c: 0 }, { r: 5, c: 1 }]
    const blockedEnd = { r: 5, c: 2 }
    const state = memory([...hits, blockedEnd], hits)
    for (let attempt = 0; attempt < 100; attempt++) {
      const shot = chooseAIShot(state, 'normal')
      expect(toIndex(shot)).not.toBe(toIndex(blockedEnd))
      expectValidShot(shot, state)
    }
  })

  it('falls back to hunting when target information is stale', () => {
    const hit = { r: 5, c: 5 }
    const fired = [hit, ...neighbours(hit)]
    const state = memory(fired, [hit])
    const shot = chooseAIShot(state, 'normal')
    expectValidShot(shot, state)
  })

  it('uses only memory and difficulty as its shot-selection inputs', () => {
    const state: AIMemory = { fired: new Set(), hits: [], sunk: [] }
    expectValidShot(chooseAIShot(state, 'normal'), state)
  })

  it('avoids hunt pockets smaller than the smallest remaining ship', () => {
    const isolated = { r: 1, c: 1 }
    const pocket = [{ r: 3, c: 3 }, { r: 3, c: 4 }]
    const corridor = [{ r: 7, c: 3 }, { r: 7, c: 4 }, { r: 7, c: 5 }]
    const state = memoryWithUnfired([isolated, ...pocket, ...corridor], [
      'carrier',
      'battleship',
      'submarine',
      'destroyer',
    ])

    for (let attempt = 0; attempt < 200; attempt++) {
      expect(corridor.map(toIndex)).toContain(toIndex(chooseAIShot(state, 'normal')))
    }
  })

  it('does not choose an isolated unfired cell while a three-cell ship remains', () => {
    const isolated = { r: 5, c: 5 }
    const corridor = [{ r: 8, c: 1 }, { r: 8, c: 2 }, { r: 8, c: 3 }]
    const state = memoryWithUnfired([isolated, ...corridor], [
      'carrier',
      'battleship',
      'submarine',
      'destroyer',
    ])

    for (let attempt = 0; attempt < 200; attempt++) {
      expect(toIndex(chooseAIShot(state, 'normal'))).not.toBe(toIndex(isolated))
    }
  })

  it('tracks the smallest remaining ship after the Destroyer sinks', () => {
    const pocket = [{ r: 2, c: 2 }, { r: 2, c: 3 }]
    const corridor = [{ r: 6, c: 1 }, { r: 6, c: 2 }, { r: 6, c: 3 }]
    const sunkBeforeDestroyer: ShipId[] = ['carrier', 'battleship', 'submarine']
    const withDestroyer = memoryWithUnfired([...pocket, ...corridor], sunkBeforeDestroyer)
    const withoutDestroyer = memoryWithUnfired([...pocket, ...corridor], [
      ...sunkBeforeDestroyer,
      'destroyer',
    ])

    const pocketIndices = new Set(pocket.map(toIndex))
    let pocketSelected = false
    for (let attempt = 0; attempt < 200; attempt++) {
      pocketSelected = pocketSelected || pocketIndices.has(toIndex(chooseAIShot(withDestroyer, 'normal')))
    }
    expect(pocketSelected).toBe(true)
    for (let attempt = 0; attempt < 200; attempt++) {
      expect(corridor.map(toIndex)).toContain(toIndex(chooseAIShot(withoutDestroyer, 'normal')))
    }
  })

  it('falls back to a valid unfired hunt cell when no cell is feasible', () => {
    const unfired = [{ r: 0, c: 0 }, { r: 5, c: 5 }]
    const state = memoryWithUnfired(unfired, [
      'carrier',
      'battleship',
      'submarine',
      'destroyer',
    ])
    const shot = chooseAIShot(state, 'normal')

    expect(unfired.map(toIndex)).toContain(toIndex(shot))
    expectValidShot(shot, state)
  })

  it('keeps Easy mode random across feasible and infeasible cells', () => {
    const isolated = { r: 0, c: 0 }
    const corridor = [{ r: 5, c: 1 }, { r: 5, c: 2 }, { r: 5, c: 3 }]
    const state = memoryWithUnfired([isolated, ...corridor], [
      'carrier',
      'battleship',
      'submarine',
      'destroyer',
    ])
    const random = vi.spyOn(Math, 'random').mockReturnValue(0)

    for (let attempt = 0; attempt < 20; attempt++) {
      expect(chooseAIShot(state, 'easy')).toEqual(isolated)
    }

    random.mockRestore()
  })
})

describe('updateAIMemory', () => {
  it('records misses and hits immutably', () => {
    const hit = { r: 2, c: 2 }
    const original = memory()
    const afterMiss = updateAIMemory(original, { r: 1, c: 1 }, { kind: 'miss', coord: { r: 1, c: 1 } })
    const afterHit = updateAIMemory(afterMiss, hit, {
      kind: 'hit',
      coord: hit,
      shipId: 'destroyer',
    })

    expect(original.fired.size).toBe(0)
    expect(original.hits).toEqual([])
    expect(afterMiss.hits).toEqual([])
    expect(afterHit.hits).toEqual([hit])
    expect(afterHit.fired.size).toBe(2)
  })

  it('removes sunk coordinates but preserves adjacent ship hits', () => {
    const sunkHit = { r: 4, c: 4 }
    const remainingHit = { r: 7, c: 7 }
    const original = memory([sunkHit, remainingHit], [sunkHit, remainingHit])
    const updated = updateAIMemory(original, { r: 4, c: 5 }, {
      kind: 'sunk',
      coord: { r: 4, c: 5 },
      shipId: 'destroyer',
      sunkCells: [sunkHit, { r: 4, c: 5 }],
    })

    expect(updated.hits).toEqual([remainingHit])
    expect(updated.fired.has(toIndex({ r: 4, c: 5 }))).toBe(true)
    expect(original.hits).toEqual([sunkHit, remainingHit])

    const target = chooseAIShot(updated, 'normal')
    expect(new Set(neighbours(remainingHit).map(toIndex)).has(toIndex(target))).toBe(true)
  })

  it('keeps hits unchanged for invalid results while recording the coordinate', () => {
    const hit = { r: 3, c: 3 }
    const coord = { r: 3, c: 4 }
    const updated = updateAIMemory(memory([hit], [hit]), coord, { kind: 'invalid' })

    expect(updated.hits).toEqual([hit])
    expect(updated.fired.has(toIndex(coord))).toBe(true)
  })

  it('records sunk ship identities without mutating the input sunk array', () => {
    const original = memory([], [], ['carrier'])
    const updated = updateAIMemory(original, { r: 2, c: 2 }, {
      kind: 'sunk',
      coord: { r: 2, c: 2 },
      shipId: 'destroyer',
      sunkCells: [{ r: 2, c: 2 }],
    })

    expect(original.sunk).toEqual(['carrier'])
    expect(updated.sunk).toEqual(['carrier', 'destroyer'])
    expect(updated.sunk).not.toBe(original.sunk)
  })
})

describe('full AI game', () => {
  it('does not repeat shots and terminates within 100 shots', () => {
    const placement = randomFleet()
    let board = placement.board
    let fleet = placement.fleet
    let ai = memory()
    const fired = new Set<number>()

    for (let shots = 0; shots < 100 && !isFleetDestroyed(fleet); shots++) {
      const coord = chooseAIShot(ai, 'normal')
      const index = toIndex(coord)
      expect(fired.has(index)).toBe(false)
      fired.add(index)

      const outcome = applyShot(board, fleet, coord)
      expect(outcome.result.kind).not.toBe('invalid')
      board = outcome.board
      fleet = outcome.fleet
      ai = updateAIMemory(ai, coord, outcome.result)
    }

    expect(isFleetDestroyed(fleet)).toBe(true)
    expect(fired.size).toBeLessThanOrEqual(100)
  })
})
