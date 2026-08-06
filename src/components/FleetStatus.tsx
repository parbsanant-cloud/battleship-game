import { FLEET } from '../game/board.ts'
import type { Ship } from '../game/types.ts'

interface FleetStatusProps {
  title: string
  ships: Ship[]
  reveal: boolean
}

export default function FleetStatus({ title, ships, reveal }: FleetStatusProps) {
  return (
    <section className="fleet-status" aria-label={title}>
      <h2 className="fleet-status__title">{title}</h2>
      <ul className="fleet-status__list">
        {FLEET.map((spec) => {
          const ship = ships.find((candidate) => candidate.id === spec.id)
          const sunk = ship?.hits === spec.length
          const status = sunk ? 'sunk' : 'afloat'

          return (
            <li
              key={spec.id}
              className={`fleet-status__row fleet-status__row--${status}`}
              aria-label={`${spec.name}, ${status}`}
            >
              <span className="fleet-status__name">{spec.name}</span>
              <span className="fleet-status__badge">{status}</span>
              {reveal && (
                <span className="fleet-status__pips" aria-label={`${ship?.hits ?? 0} hits`}>
                  {Array.from({ length: spec.length }, (_, index) => (
                    <span key={index} className={index < (ship?.hits ?? 0) ? 'pip pip--filled' : 'pip'} />
                  ))}
                </span>
              )}
            </li>
          )
        })}
      </ul>
    </section>
  )
}
