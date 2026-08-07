import { CELL_COUNT, inBounds, neighbours, toCoord, toIndex } from './board.ts'
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

function hunt(memory: AIMemory): Coord {
  const candidates = Array.from({ length: CELL_COUNT }, (_, index) => index).filter(
    (index) => !memory.fired.has(index),
  )
  return pickRandom(candidates)
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
  if (difficulty === 'easy') return hunt(memory)
  const line = lineCandidates(memory)
  if (line.length > 0) return pickRandomCoords(line)
  const adjacent = neighbourCandidates(memory)
  if (adjacent.length > 0) return pickRandomCoords(adjacent)
  return hunt(memory)
}

export function updateAIMemory(memory: AIMemory, coord: Coord, result: ShotResult): AIMemory {
  let hits = [...memory.hits]
  if (result.kind === 'hit') {
    hits.push(coord)
  } else if (result.kind === 'sunk') {
    const sunkIndices = new Set(result.sunkCells.map(toIndex))
    hits = hits.filter((hit) => !sunkIndices.has(toIndex(hit)))
  }

  return {
    fired: new Set(memory.fired).add(toIndex(coord)),
    hits,
  }
}
