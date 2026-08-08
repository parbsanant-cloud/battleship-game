import type { Difficulty } from '../game/types.ts'

const DIFFICULTIES: { value: Difficulty; label: string; hint: string }[] = [
  { value: 'easy', label: 'Easy', hint: 'Fires at random' },
  { value: 'normal', label: 'Normal', hint: 'Hunts down your ships' },
]

interface DifficultySelectProps {
  legend: string
  difficulty: Difficulty
  name: string
  className?: string
  onDifficultyChange: (difficulty: Difficulty) => void
}

export default function DifficultySelect({
  legend,
  difficulty,
  name,
  className,
  onDifficultyChange,
}: DifficultySelectProps) {
  return (
    <fieldset className={`difficulty-select${className ? ` ${className}` : ''}`}>
      <legend className="tactical-label">{legend}</legend>
      {DIFFICULTIES.map((option) => (
        <label key={option.value} className="difficulty-select__option">
          <input
            type="radio"
            name={name}
            value={option.value}
            checked={difficulty === option.value}
            onChange={() => onDifficultyChange(option.value)}
          />
          <span className="difficulty-select__label">{option.label}</span>
          <span className="difficulty-select__hint">{option.hint}</span>
        </label>
      ))}
    </fieldset>
  )
}
