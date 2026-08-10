import type { BattleLogEntry, Phase, Player } from '../game/types.ts'

interface CommsProps {
  entries: BattleLogEntry[]
  message: string
  phase: Phase
  winner: Player | null
}

function channelLabel(phase: Phase, winner: Player | null): string {
  if (phase === 'gameOver') return winner === 'player' ? 'Ithaca sighted' : 'Claimed by the sea'
  return phase === 'aiTurn' ? 'Poseidon stirs' : 'The crossing'
}

export default function Comms({ entries, message, phase, winner }: CommsProps) {
  return (
    <aside className="comms" aria-label="Omens and voices">
      <div className="comms__header">
        <div>
          <span className="comms__eyebrow">Whispers from the deep</span>
          <h2 className="comms__title">OMENS &amp; VOICES</h2>
        </div>
        <span className="comms__status">{channelLabel(phase, winner)}</span>
      </div>
      <div className="comms__live" aria-live="polite" aria-atomic="true">
        {message}
      </div>
      {entries.length === 0 && !message ? (
        <p className="comms__empty">No omens recorded.</p>
      ) : entries.length > 0 ? (
        <ol className="comms__list">
          {entries.map((entry, index) => (
            <li
              key={`${entry.id}-${entry.message}`}
              className={`comms__entry${index === 0 ? ' comms__entry--latest' : ''}`}
            >
              <span className="comms__index">
                {String(entries.length - index).padStart(2, '0')}
              </span>
              <span>{entry.message}</span>
            </li>
          ))}
        </ol>
      ) : null}
    </aside>
  )
}
