import DifficultySelect from './DifficultySelect.tsx'
import { FLEET } from '../game/board.ts'
import type { Difficulty, Orientation, Ship, ShipId } from '../game/types.ts'

interface PlacementPanelProps {
  fleet: Ship[]
  selectedShipId: ShipId | null
  orientation: Orientation
  difficulty: Difficulty
  canStart: boolean
  onSelectShip: (shipId: ShipId) => void
  onRotate: () => void
  onRandomize: () => void
  onClear: () => void
  onStart: () => void
  onDifficultyChange: (difficulty: Difficulty) => void
}

export default function PlacementPanel({
  fleet,
  selectedShipId,
  orientation,
  difficulty,
  canStart,
  onSelectShip,
  onRotate,
  onRandomize,
  onClear,
  onStart,
  onDifficultyChange,
}: PlacementPanelProps) {
  return (
    <aside className="deployment-panel">
      <div className="deployment-panel__intro">
        <span className="tactical-label">READY THE FLEET</span>
        <h2 className="deployment-panel__title">SHIPS OF ITHACA</h2>
        <p className="deployment-panel__instruction">Set your ships upon the wine-dark sea before dawn.</p>
      </div>
      <section className="deployment-panel__section">
        <ul className="ships">
          {FLEET.map((spec) => {
            const placed = fleet.some((ship) => ship.id === spec.id)
            const selected = spec.id === selectedShipId
            return (
              <li key={spec.id}>
                <button
                  type="button"
                  className={`ship${selected ? ' ship--selected' : ''}${placed ? ' ship--placed' : ''}`}
                  aria-pressed={selected}
                  disabled={placed}
                  onClick={() => onSelectShip(spec.id)}
                >
                  <span className="ship__name">{spec.name}</span>
                  <span className="ship__pips" aria-hidden="true">
                    {'\u25A0'.repeat(spec.length)}
                  </span>
                  <span className="ship__status">{placed ? 'READY' : `${spec.length} cells`}</span>
                </button>
              </li>
            )
          })}
        </ul>
      </section>

      <section className="deployment-panel__section deployment-panel__controls">
        <span className="tactical-label">Disposition</span>
        <button type="button" className="button" onClick={onRotate}>
          Orientation — {orientation === 'H' ? 'Horizontal' : 'Vertical'}
          <kbd className="kbd">R</kbd>
        </button>
        <div className="panel__row">
          <button type="button" className="button" onClick={onRandomize}>
            Randomize
          </button>
          <button type="button" className="button" onClick={onClear}>
            Clear
          </button>
        </div>
      </section>

      <section className="deployment-panel__section">
        <DifficultySelect
          legend="The seas ahead"
          name="difficulty"
          difficulty={difficulty}
          onDifficultyChange={onDifficultyChange}
        />
      </section>

      <button type="button" className="button button--primary" disabled={!canStart} onClick={onStart}>
        BEGIN THE CROSSING
      </button>
      {!canStart && (
        <p className="deployment-panel__note">
          {FLEET.length - fleet.length} vessel{FLEET.length - fleet.length === 1 ? '' : 's'} remain before the crossing.
        </p>
      )}
    </aside>
  )
}
