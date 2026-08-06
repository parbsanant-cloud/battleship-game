import type { Phase, Player } from '../game/types.ts'

interface StatusBarProps {
  phase: Phase
  winner: Player | null
  message: string
}

function turnLabel(phase: Phase, winner: Player | null): string {
  switch (phase) {
    case 'playerTurn':
      return 'Your turn'
    case 'aiTurn':
      return 'Opponent is aiming…'
    case 'gameOver':
      return winner === 'player' ? 'Victory' : 'Defeat'
    default:
      return ''
  }
}

export default function StatusBar({ phase, winner, message }: StatusBarProps) {
  return (
    <div className={`status status--${phase}`}>
      <p className="status__turn" aria-live="polite">
        {turnLabel(phase, winner)}
      </p>
      <p className="status__message" aria-live="polite">
        {message}
      </p>
    </div>
  )
}
