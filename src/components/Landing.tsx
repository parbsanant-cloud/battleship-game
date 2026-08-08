import DifficultySelect from './DifficultySelect.tsx'
import type { Difficulty } from '../game/types.ts'

interface LandingProps {
  difficulty: Difficulty
  onDifficultyChange: (difficulty: Difficulty) => void
  onStartMission: () => void
}

export default function Landing({
  difficulty,
  onDifficultyChange,
  onStartMission,
}: LandingProps) {
  return (
    <main className="landing screen-enter">
      <div className="landing__card">
        <h1 className="landing__title">Battleship</h1>
        <p className="landing__subtitle">
          Take command of your fleet and defeat an adaptive AI commander.
        </p>
        <DifficultySelect
          legend="Opponent"
          name="landing-difficulty"
          difficulty={difficulty}
          onDifficultyChange={onDifficultyChange}
        />
        <button
          type="button"
          className="button button--primary landing__start"
          onClick={onStartMission}
        >
          Start Mission
        </button>
      </div>
    </main>
  )
}
