import DifficultySelect from './DifficultySelect.tsx'
import type { Difficulty } from '../game/types.ts'

interface LandingProps {
  difficulty: Difficulty
  exiting?: boolean
  soundMuted: boolean
  voiceMuted: boolean
  onDifficultyChange: (difficulty: Difficulty) => void
  onStartMission: () => void
  onToggleSound: () => void
  onToggleVoice: () => void
}

export default function Landing({
  difficulty,
  exiting = false,
  soundMuted,
  voiceMuted,
  onDifficultyChange,
  onStartMission,
  onToggleSound,
  onToggleVoice,
}: LandingProps) {
  return (
    <main className={`briefing screen-enter${exiting ? ' briefing--exiting' : ''}`}>
      <div className="briefing__masthead">
        <span className="briefing__eyebrow">THE VOYAGE</span>
        <span className="briefing__classification">Beyond the horizon</span>
      </div>
      <div className="landing__card">
        <svg
          className="landing__mark"
          viewBox="0 0 48 48"
          role="img"
          aria-hidden="true"
          focusable="false"
        >
          <path d="M7 31H36L43 24L36 38H15Z" />
          <path d="M18 29V11M18 11L32 29M18 15L27 29" />
          <path d="M10 35L4 39M17 35L11 41M25 35L20 42M33 35L29 41" />
          <path d="M4 23C13 19 24 20 35 23" className="landing__mark-sweep" />
        </svg>
        <span className="landing__eyebrow">A Homeric voyage</span>
        <h1 className="landing__title">NOSTOS</h1>
        <p className="landing__subtitle">A game of war, fate, and the long voyage home.</p>
        <p className="landing__briefing">
          Ten years after war, your fleet turns west.
          <br />
          Poseidon has other plans.
          <br />
          Cross the wine-dark sea. Break the fleet sent against you. Return home.
        </p>
        <DifficultySelect
          legend="The seas ahead"
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
          BEGIN THE VOYAGE
        </button>
        <div className="briefing__audio" aria-label="Audio controls">
          <button
            type="button"
            className="rail-control"
            aria-label={soundMuted ? 'Turn sound on' : 'Mute sound'}
            aria-pressed={!soundMuted}
            onClick={onToggleSound}
          >
            SFX {soundMuted ? 'OFF' : 'ON'}
          </button>
          <button
            type="button"
            className="rail-control"
            aria-label={voiceMuted ? 'Turn voice callouts on' : 'Mute voice callouts'}
            aria-pressed={!voiceMuted}
            onClick={onToggleVoice}
          >
            Voice {voiceMuted ? 'OFF' : 'ON'}
          </button>
        </div>
      </div>
    </main>
  )
}
