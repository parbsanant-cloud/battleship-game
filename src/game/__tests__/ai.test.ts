import { describe, expect, it, vi } from 'vitest'
import { chooseAIShot, updateAIMemory } from '../ai.ts'
import { inBounds, neighbours, toIndex } from '../board.ts'
import { randomFleet } from '../placement.ts'
import { applyShot, isFleetDestroyed } from '../rules.ts'
import type { AIMemory, Coord } from '../types.ts'

function memory(fired: Coord[] = [], hits: Coord[] = []): AIMemory {
  return {
    fired: new Set(fired.map(toIndex)),
    hits: [...hits],
  }
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
    const state: AIMemory = { fired: new Set(), hits: [] }
    expectValidShot(chooseAIShot(state, 'normal'), state)
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
