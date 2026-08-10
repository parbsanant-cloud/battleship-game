import { useEffect, useRef } from 'react'
import type { Difficulty, Player, Stats } from '../game/types.ts'
import { difficultyLabel } from '../presentation.ts'

interface GameOverProps {
  winner: Player
  stats: Stats
  playerShipsRemaining: number
  aiShipsRemaining: number
  difficulty: Difficulty
  onDismiss: () => void
  onPlayAgain: () => void
}

export default function GameOver({
  winner,
  stats,
  playerShipsRemaining,
  aiShipsRemaining,
  difficulty,
  onDismiss,
  onPlayAgain,
}: GameOverProps) {
  const playAgainRef = useRef<HTMLButtonElement>(null)
  const playerAccuracy =
    stats.playerShots === 0 ? 0 : Math.round((stats.playerHits / stats.playerShots) * 100)
  const aiAccuracy = stats.aiShots === 0 ? 0 : Math.round((stats.aiHits / stats.aiShots) * 100)
  const victory = winner === 'player'

  useEffect(() => {
    playAgainRef.current?.focus()
    function onKeyDown(event: KeyboardEvent) {
      if (event.key !== 'Escape') return
      event.preventDefault()
      onDismiss()
    }

    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [onDismiss])

  return (
    <>
      {victory && <Confetti />}
      <div
        className="game-over-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="game-over-heading"
      >
        <div className="game-over-modal__backdrop" aria-hidden="true" />
        <section className={`panel game-over game-over--${victory ? 'victory' : 'defeat'}`}>
          <button
            type="button"
            className="game-over__close"
            aria-label="Close mission report"
            onClick={onDismiss}
          >
            ×
          </button>
          <div aria-live="assertive">
            <h2 id="game-over-heading" className="panel__heading game-over__title">
              {victory ? 'ITHACA' : 'CLAIMED BY THE SEA'}
            </h2>
            <p className="game-over__verdict">
              {victory
                ? 'The storm breaks. Beyond the black water, you see firelight on the shore. After war, wrath, and the endless sea — you are home.'
                : 'The storm closes over the last mast. Ithaca remains beyond the horizon.'}
            </p>
          </div>
          <div className="game-over__stamp">THE FINAL ACCOUNT // {difficultyLabel(difficulty)}</div>
          <dl className="game-over__stats">
            <div>
              <dt>Your accuracy</dt>
              <dd>{playerAccuracy}%</dd>
            </div>
            <div>
              <dt>Poseidon's accuracy</dt>
              <dd>{aiAccuracy}%</dd>
            </div>
            <div>
              <dt>Your shots</dt>
              <dd>{stats.playerShots}</dd>
            </div>
            <div>
              <dt>Poseidon's strikes</dt>
              <dd>{stats.aiShots}</dd>
            </div>
            <div>
              <dt>Total shots</dt>
              <dd>{stats.playerShots + stats.aiShots}</dd>
            </div>
            <div>
              <dt>Your ships left</dt>
              <dd>{playerShipsRemaining}</dd>
            </div>
            <div>
              <dt>Enemy vessels left</dt>
              <dd>{aiShipsRemaining}</dd>
            </div>
          </dl>
          {!victory && (
            <p className="game-over__note">
              Poseidon's fleet is revealed upon the waters behind you.
            </p>
          )}
          <button
            ref={playAgainRef}
            type="button"
            className="button button--primary"
            onClick={onPlayAgain}
          >
            {victory ? 'SAIL AGAIN' : 'DEFY THE GODS AGAIN'}
          </button>
        </section>
      </div>
    </>
  )
}

const CONFETTI_PIECES = Array.from({ length: 16 }, (_, index) => index)

function Confetti() {
  return (
    <div className="confetti" aria-hidden="true">
      {CONFETTI_PIECES.map((piece) => (
        <span
          key={piece}
          className="confetti__piece"
          style={{
            left: `${(piece * 100) / CONFETTI_PIECES.length + 2}%`,
            animationDelay: `${(piece % 5) * 120}ms`,
          }}
        />
      ))}
    </div>
  )
}
