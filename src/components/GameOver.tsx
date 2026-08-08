import { useEffect, useRef } from 'react'
import type { Player, Stats } from '../game/types.ts'

interface GameOverProps {
  winner: Player
  stats: Stats
  playerShipsRemaining: number
  aiShipsRemaining: number
  onPlayAgain: () => void
}

export default function GameOver({
  winner,
  stats,
  playerShipsRemaining,
  aiShipsRemaining,
  onPlayAgain,
}: GameOverProps) {
  const playAgainRef = useRef<HTMLButtonElement>(null)
  const playerAccuracy =
    stats.playerShots === 0 ? 0 : Math.round((stats.playerHits / stats.playerShots) * 100)
  const aiAccuracy = stats.aiShots === 0 ? 0 : Math.round((stats.aiHits / stats.aiShots) * 100)
  const victory = winner === 'player'

  useEffect(() => {
    playAgainRef.current?.focus()
  }, [])

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
          <div aria-live="assertive">
            <h2 id="game-over-heading" className="panel__heading game-over__title">
              {victory ? 'Mission accomplished' : 'Mission failed'}
            </h2>
            <p className="game-over__verdict">
              {victory ? 'Enemy fleet destroyed.' : 'Enemy fleet prevailed.'}
            </p>
          </div>
          <dl className="game-over__stats">
            <div>
              <dt>Your accuracy</dt>
              <dd>{playerAccuracy}%</dd>
            </div>
            <div>
              <dt>AI accuracy</dt>
              <dd>{aiAccuracy}%</dd>
            </div>
            <div>
              <dt>Your shots</dt>
              <dd>{stats.playerShots}</dd>
            </div>
            <div>
              <dt>AI shots</dt>
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
              <dt>Enemy ships left</dt>
              <dd>{aiShipsRemaining}</dd>
            </div>
          </dl>
          {!victory && (
            <p className="game-over__note">
              The remaining enemy fleet has been revealed on the board.
            </p>
          )}
          <button
            ref={playAgainRef}
            type="button"
            className="button button--primary"
            onClick={onPlayAgain}
          >
            Play Again
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
