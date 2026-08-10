import type { RefObject } from 'react'
import type { Difficulty, Phase, Player, Stats } from '../game/types.ts'
import { difficultyLabel } from '../presentation.ts'

interface CommandRailProps {
  phase: Phase
  winner: Player | null
  difficulty: Difficulty
  stats: Stats
  soundMuted: boolean
  voiceMuted: boolean
  showGameOverActions: boolean
  playAgainRef: RefObject<HTMLButtonElement | null>
  onToggleSound: () => void
  onToggleVoice: () => void
  onShowReport: () => void
  onPlayAgain: () => void
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
  showGameOverActions,
  playAgainRef,
  onToggleSound,
  onToggleVoice,
  onShowReport,
  onPlayAgain,
}: CommandRailProps) {
  return (
    <header className="command-rail">
      <div className="command-rail__identity">
        <span className="command-rail__eyebrow">The long voyage</span>
        <h1 className="command-rail__title">NOSTOS</h1>
        <span className="command-rail__classification">Ithaca // beyond the horizon</span>
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
          <span className="readout__label">Difficulty</span>
          <strong>{difficultyLabel(difficulty)}</strong>
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
      <div
        className={`command-rail__controls${
          showGameOverActions ? ' command-rail__controls--mission' : ''
        }`}
        aria-label="Mission and audio controls"
      >
        {showGameOverActions && (
          <>
            <button type="button" className="rail-control" onClick={onShowReport}>
              THE FINAL ACCOUNT
            </button>
            <button
              ref={playAgainRef}
              type="button"
              className="rail-control rail-control--primary"
              onClick={onPlayAgain}
            >
              SAIL AGAIN
            </button>
          </>
        )}
        <button
          type="button"
          className="rail-control"
          aria-label={soundMuted ? 'Turn sound on' : 'Mute sound'}
          aria-pressed={!soundMuted}
          onClick={onToggleSound}
        >
          <span aria-hidden="true">{soundMuted ? '◌' : '●'}</span> SFX {soundMuted ? 'OFF' : 'ON'}
        </button>
        <button
          type="button"
          className="rail-control"
          aria-label={voiceMuted ? 'Turn voice callouts on' : 'Mute voice callouts'}
          aria-pressed={!voiceMuted}
          onClick={onToggleVoice}
        >
          <span aria-hidden="true">{voiceMuted ? '◌' : '●'}</span>
          {' VOICE '}
          {voiceMuted ? 'OFF' : 'ON'}
        </button>
      </div>
    </header>
  )
}
