import { FLEET } from '../game/board.ts'
import type { Ship, ShipId } from '../game/types.ts'

interface FleetStatusProps {
  title: string
  ships: Ship[]
  highlightShipId?: ShipId | null
  variant?: 'player' | 'enemy' | 'deployment'
}

export default function FleetStatus({
  title,
  ships,
  highlightShipId = null,
  variant = 'player',
}: FleetStatusProps) {
  const vessels =
    variant === 'deployment' ? ships.length : ships.filter((ship) => ship.hits < ship.length).length

  return (
    <section className={`fleet-status fleet-status--${variant}`} aria-label={title}>
      <div className="fleet-status__header">
        <div>
          <span className="fleet-status__eyebrow">The fleet</span>
          <h2 className="fleet-status__title">{title}</h2>
        </div>
        <span className="fleet-status__count">{vessels} / {FLEET.length}</span>
      </div>
      <ul className="fleet-status__list">
        {FLEET.map((spec) => {
          const ship = ships.find((candidate) => candidate.id === spec.id)
          const hits = ship?.hits ?? 0
          const sunk = hits === spec.length
          const damaged = hits > 0
          const critical = damaged && !sunk && hits >= spec.length - 1
          const status = sunk
            ? 'SUNK'
            : critical
              ? 'FALTERING'
              : damaged
                ? 'WOUNDED'
                : variant === 'deployment' && ship
                  ? 'READY'
                  : 'WHOLE'
          const name = spec.name

          return (
            <li
              key={spec.id}
              className={`fleet-status__row fleet-status__row--${status.toLowerCase()}${
                highlightShipId === spec.id ? ' fleet-status__row--highlight' : ''
              }`}
            >
              <span className="fleet-status__name">{name}</span>
              <span className="fleet-status__badge">{status}</span>
              <span
                className="fleet-status__pips"
                role="img"
                aria-label={`${hits} of ${spec.length} cells hit`}
              >
                {Array.from({ length: spec.length }, (_, index) => (
                  <span key={index} className={index < hits ? 'pip pip--filled' : 'pip'} />
                ))}
              </span>
            </li>
          )
        })}
      </ul>
    </section>
  )
}
