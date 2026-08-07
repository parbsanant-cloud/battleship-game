import { FLEET } from '../game/board.ts'
import type { Ship } from '../game/types.ts'

interface FleetStatusProps {
  title: string
  ships: Ship[]
}

export default function FleetStatus({ title, ships }: FleetStatusProps) {
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
            >
              <span className="fleet-status__name">{spec.name}</span>
              <span className="fleet-status__badge">{status}</span>
              <span
                className="fleet-status__pips"
                role="img"
                aria-label={`${ship?.hits ?? 0} of ${spec.length} cells hit`}
              >
                {Array.from({ length: spec.length }, (_, index) => (
                  <span key={index} className={index < (ship?.hits ?? 0) ? 'pip pip--filled' : 'pip'} />
                ))}
              </span>
            </li>
          )
        })}
      </ul>
    </section>
  )
}
