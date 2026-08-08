import DifficultySelect from './DifficultySelect.tsx'
import type { Difficulty } from '../game/types.ts'

interface LandingProps {
  difficulty: Difficulty
  exiting?: boolean
  onDifficultyChange: (difficulty: Difficulty) => void
  onStartMission: () => void
}

export default function Landing({
  difficulty,
  exiting = false,
  onDifficultyChange,
  onStartMission,
}: LandingProps) {
  return (
    <main className={`landing screen-enter${exiting ? ' landing--exiting' : ''}`}>
      <div className="landing__card">
        <svg
          className="landing__mark"
          viewBox="0 0 48 48"
          role="img"
          aria-hidden="true"
          focusable="false"
        >
          <circle cx="24" cy="24" r="21" />
          <circle cx="24" cy="24" r="13" />
          <circle cx="24" cy="24" r="2.5" className="landing__mark-hub" />
          <path d="M24 3v42M3 24h42" />
          <path d="M24 24 41 13" className="landing__mark-sweep" />
        </svg>
        <h1 className="landing__title">Battleship</h1>
        <p className="landing__subtitle">
          Take command of your fleet and defeat an adaptive AI commander.
        </p>
        <DifficultySelect
          legend="Opponent"
          name="landing-difficulty"
          className="landing__difficulty"
          difficulty={difficulty}
          onDifficultyChange={onDifficultyChange}
        />
        <button
          type="button"
          className="button button--primary landing__start"
          disabled={exiting}
          onClick={onStartMission}
        >
          Start Mission
        </button>
      </div>
    </main>
  )
}
