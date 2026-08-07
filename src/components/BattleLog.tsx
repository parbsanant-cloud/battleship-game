import type { BattleLogEntry } from '../game/types.ts'

interface BattleLogProps {
  entries: BattleLogEntry[]
}

export default function BattleLog({ entries }: BattleLogProps) {
  return (
    <section className="battle-log" aria-hidden="true">
      <h2 className="battle-log__title">Battle log</h2>
      {entries.length === 0 ? (
        <p className="battle-log__empty">No shots yet.</p>
      ) : (
        <ol className="battle-log__list">
          {entries.map((entry) => (
            <li key={entry.id} className="battle-log__entry">
              {entry.message}
            </li>
          ))}
        </ol>
      )}
    </section>
  )
}
