import type { Difficulty, Phase, Player, Stats } from '../game/types.ts'

interface CommandRailProps {
  phase: Phase
  winner: Player | null
  difficulty: Difficulty
  stats: Stats
  soundMuted: boolean
  voiceMuted: boolean
  onToggleSound: () => void
  onToggleVoice: () => void
}

function accuracy(hits: number, shots: number): string {
  return `${shots === 0 ? 0 : Math.round((hits / shots) * 100)}%`
}

function turnLabel(phase: Phase, winner: Player | null): string {
  if (phase === 'gameOver') return winner === 'player' ? 'Victory' : 'Defeat'
  return phase === 'aiTurn' ? 'Enemy action' : 'Your action'
}

export default function CommandRail({
  phase,
  winner,
  difficulty,
  stats,
  soundMuted,
  voiceMuted,
  onToggleSound,
  onToggleVoice,
}: CommandRailProps) {
  return (
    <header className="command-rail">
      <div className="command-rail__identity">
        <span className="command-rail__eyebrow">Operation Broadside // CIC 07</span>
        <h1 className="command-rail__title">Battleship</h1>
        <span className="command-rail__classification">CLASSIFIED // LIVE</span>
      </div>
      <div className="command-rail__strip" aria-hidden="true">
        <span />
        <span />
        <span />
        <span />
        <span />
      </div>
      <div className="command-rail__readouts" aria-label="Mission readouts">
        <div className="readout">
          <span className="readout__label">Status</span>
          <strong>{turnLabel(phase, winner)}</strong>
        </div>
        <div className="readout">
          <span className="readout__label">Level</span>
          <strong>{difficulty.toUpperCase()}</strong>
        </div>
        <div className="readout">
          <span className="readout__label">Shots</span>
          <strong>{stats.playerShots}</strong>
        </div>
        <div className="readout">
          <span className="readout__label">Hits</span>
          <strong>{stats.playerHits}</strong>
        </div>
        <div className="readout">
          <span className="readout__label">Accuracy</span>
          <strong>{accuracy(stats.playerHits, stats.playerShots)}</strong>
        </div>
      </div>
      <div className="command-rail__controls" aria-label="Audio controls">
        <button
          type="button"
          className="audio-toggle"
          aria-label={soundMuted ? 'Turn sound on' : 'Mute sound'}
          aria-pressed={!soundMuted}
          onClick={onToggleSound}
        >
          <span aria-hidden="true">{soundMuted ? '◌' : '●'}</span> SFX {soundMuted ? 'OFF' : 'ON'}
        </button>
        <button
          type="button"
          className="audio-toggle"
          aria-label={voiceMuted ? 'Turn voice callouts on' : 'Mute voice callouts'}
          aria-pressed={!voiceMuted}
          onClick={onToggleVoice}
        >
          <span aria-hidden="true">{voiceMuted ? '◌' : '●'}</span> VOICE{' '}
          {voiceMuted ? 'OFF' : 'ON'}
        </button>
      </div>
    </header>
  )
}
