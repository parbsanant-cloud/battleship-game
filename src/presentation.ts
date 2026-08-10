import type { Difficulty } from './game/types.ts'

export function difficultyLabel(difficulty: Difficulty): string {
  return difficulty === 'easy' ? 'MORTAL SEAS' : 'WRATH OF POSEIDON'
}
