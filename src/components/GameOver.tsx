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
  const playerAccuracy =
    stats.playerShots === 0 ? 0 : Math.round((stats.playerHits / stats.playerShots) * 100)
  const aiAccuracy = stats.aiShots === 0 ? 0 : Math.round((stats.aiHits / stats.aiShots) * 100)
  const victory = winner === 'player'

  return (
    <section
      className={`panel game-over game-over--${victory ? 'victory' : 'defeat'}`}
      aria-labelledby="game-over-heading"
    >
      <div aria-live="assertive">
        <h2 id="game-over-heading" className="panel__heading">
          {victory ? 'Victory' : 'Defeat'}
        </h2>
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
      <button type="button" className="button button--primary" onClick={onPlayAgain}>
        Play Again
      </button>
    </section>
  )
}
