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
        <span className="briefing__eyebrow">Naval operations // CIC 07</span>
        <span className="briefing__classification">Eyes only</span>
      </div>
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
        <span className="landing__eyebrow">Briefing room // Operation Broadside</span>
        <h1 className="landing__title">Battleship</h1>
        <p className="landing__subtitle">Locate and neutralize the opposing fleet before contact is lost.</p>
        <DifficultySelect
          legend="Threat profile"
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
        <div className="briefing__audio" aria-label="Audio controls">
          <button
            type="button"
            className="audio-toggle"
            aria-label={soundMuted ? 'Turn sound on' : 'Mute sound'}
            aria-pressed={!soundMuted}
            onClick={onToggleSound}
          >
            SFX {soundMuted ? 'OFF' : 'ON'}
          </button>
          <button
            type="button"
            className="audio-toggle"
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
