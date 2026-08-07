import { CELL_COUNT, FLEET, inBounds, neighbours, toCoord, toIndex } from './board.ts'
import type { ShotResult } from './rules.ts'
import type { AIMemory, Coord, Difficulty } from './types.ts'

function isUnfired(memory: AIMemory, coord: Coord): boolean {
  return inBounds(coord) && !memory.fired.has(toIndex(coord))
}

function pickRandom(candidates: number[]): Coord {
  if (candidates.length === 0) throw new Error('AI has no unfired cells')
  return toCoord(candidates[Math.floor(Math.random() * candidates.length)])
}

function pickRandomCoords(candidates: Coord[]): Coord {
  return pickRandom(candidates.map(toIndex))
}

function randomUnfired(memory: AIMemory): Coord {
  const candidates = Array.from({ length: CELL_COUNT }, (_, index) => index).filter(
    (index) => !memory.fired.has(index),
  )
  return pickRandom(candidates)
}

function smallestRemainingShipLength(memory: AIMemory): number {
  const sunk = new Set(memory.sunk)
  const lengths = FLEET.filter((spec) => !sunk.has(spec.id)).map((spec) => spec.length)
  return lengths.length > 0 ? Math.min(...lengths) : 1
}

function hasFeasibleRun(memory: AIMemory, coord: Coord, length: number): boolean {
  if (!isUnfired(memory, coord)) return false
  if (length <= 1) return true

  for (const horizontal of [true, false]) {
    let run = 1
    for (const direction of [-1, 1]) {
      let variable = (horizontal ? coord.c : coord.r) + direction
      while (true) {
        const next = horizontal ? { r: coord.r, c: variable } : { r: variable, c: coord.c }
        if (!isUnfired(memory, next)) break
        run++
        if (run >= length) return true
        variable += direction
      }
    }
  }
  return false
}

function hunt(memory: AIMemory, length: number): Coord {
  const candidates = Array.from({ length: CELL_COUNT }, (_, index) => index)
    .filter((index) => !memory.fired.has(index))
    .filter((index) => hasFeasibleRun(memory, toCoord(index), length))
  return candidates.length > 0 ? pickRandom(candidates) : randomUnfired(memory)
}

function addCandidate(candidates: Set<number>, memory: AIMemory, coord: Coord): void {
  if (isUnfired(memory, coord)) candidates.add(toIndex(coord))
}

function allBetweenUnfired(memory: AIMemory, fixed: number, start: number, end: number, horizontal: boolean) {
  for (let variable = start + 1; variable < end; variable++) {
    const coord = horizontal ? { r: fixed, c: variable } : { r: variable, c: fixed }
    if (!isUnfired(memory, coord)) return false
  }
  return true
}

function lineCandidates(memory: AIMemory): Coord[] {
  const candidates = new Set<number>()
  for (const horizontal of [true, false]) {
    const groups = new Map<number, number[]>()
    for (const hit of memory.hits) {
      const fixed = horizontal ? hit.r : hit.c
      const variable = horizontal ? hit.c : hit.r
      const group = groups.get(fixed) ?? []
      group.push(variable)
      groups.set(fixed, group)
    }

    for (const [fixed, variables] of groups) {
      variables.sort((a, b) => a - b)
      let runStart = 0
      for (let index = 1; index <= variables.length; index++) {
        const linked =
          index < variables.length &&
          allBetweenUnfired(memory, fixed, variables[index - 1], variables[index], horizontal)
        if (linked) continue

        if (index - runStart >= 2) {
          const min = variables[runStart]
          const max = variables[index - 1]
          for (let variable = min + 1; variable < max; variable++) {
            addCandidate(
              candidates,
              memory,
              horizontal ? { r: fixed, c: variable } : { r: variable, c: fixed },
            )
          }
          addCandidate(
            candidates,
            memory,
            horizontal ? { r: fixed, c: min - 1 } : { r: min - 1, c: fixed },
          )
          addCandidate(
            candidates,
            memory,
            horizontal ? { r: fixed, c: max + 1 } : { r: max + 1, c: fixed },
          )
        }
        runStart = index
      }
    }
  }
  return Array.from(candidates, toCoord)
}

function neighbourCandidates(memory: AIMemory): Coord[] {
  const candidates = new Set<number>()
  for (const hit of memory.hits) {
    for (const neighbour of neighbours(hit)) addCandidate(candidates, memory, neighbour)
  }
  return Array.from(candidates, toCoord)
}

export function chooseAIShot(memory: AIMemory, difficulty: Difficulty): Coord {
  if (difficulty === 'easy') return randomUnfired(memory)
  const line = lineCandidates(memory)
  if (line.length > 0) return pickRandomCoords(line)
  const adjacent = neighbourCandidates(memory)
  if (adjacent.length > 0) return pickRandomCoords(adjacent)
  return hunt(memory, smallestRemainingShipLength(memory))
}

export function updateAIMemory(memory: AIMemory, coord: Coord, result: ShotResult): AIMemory {
  let hits = [...memory.hits]
  const sunk = [...memory.sunk]
  if (result.kind === 'hit') {
    hits.push(coord)
  } else if (result.kind === 'sunk') {
    const sunkIndices = new Set(result.sunkCells.map(toIndex))
    hits = hits.filter((hit) => !sunkIndices.has(toIndex(hit)))
    sunk.push(result.shipId)
  }

  return {
    fired: new Set(memory.fired).add(toIndex(coord)),
    hits,
    sunk,
  }
}
