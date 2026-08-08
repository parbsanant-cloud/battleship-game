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
    <fieldset className={`fieldset${className ? ` ${className}` : ''}`}>
      <legend className="panel__heading">{legend}</legend>
      {DIFFICULTIES.map((option) => (
        <label key={option.value} className="radio">
          <input
            type="radio"
            name={name}
            value={option.value}
            checked={difficulty === option.value}
            onChange={() => onDifficultyChange(option.value)}
          />
          <span className="radio__label">{option.label}</span>
          <span className="radio__hint">{option.hint}</span>
        </label>
      ))}
    </fieldset>
  )
}
