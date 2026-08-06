import type { Player, Stats } from '../game/types.ts'

interface GameOverProps {
  winner: Player
  stats: Stats
  onPlayAgain: () => void
}

export default function GameOver({ winner, stats, onPlayAgain }: GameOverProps) {
  const accuracy = stats.playerShots === 0 ? 0 : Math.round((stats.playerHits / stats.playerShots) * 100)

  return (
    <section className="panel game-over" aria-labelledby="game-over-heading">
      <div aria-live="assertive">
        <h2 id="game-over-heading" className="panel__heading">
          {winner === 'player' ? 'You win!' : 'The enemy wins.'}
        </h2>
      </div>
      <dl className="game-over__stats">
        <div>
          <dt>Shots</dt>
          <dd>{stats.playerShots}</dd>
        </div>
        <div>
          <dt>Hits</dt>
          <dd>{stats.playerHits}</dd>
        </div>
        <div>
          <dt>Accuracy</dt>
          <dd>{accuracy}%</dd>
        </div>
      </dl>
      <button type="button" className="button button--primary" onClick={onPlayAgain}>
        Play Again
      </button>
    </section>
  )
}
