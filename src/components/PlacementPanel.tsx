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
    <aside className="panel">
      <section className="panel__section">
        <h2 className="panel__heading">Your fleet</h2>
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
                  <span className="ship__status">{placed ? 'Placed' : `${spec.length} cells`}</span>
                </button>
              </li>
            )
          })}
        </ul>
      </section>

      <section className="panel__section">
        <h2 className="panel__heading">Placement</h2>
        <button type="button" className="button" onClick={onRotate}>
          Rotate — {orientation === 'H' ? 'Horizontal' : 'Vertical'}
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

      <section className="panel__section">
        <DifficultySelect
          legend="Opponent"
          name="difficulty"
          difficulty={difficulty}
          onDifficultyChange={onDifficultyChange}
        />
      </section>

      <button type="button" className="button button--primary" disabled={!canStart} onClick={onStart}>
        Start Game
      </button>
      {!canStart && (
        <p className="panel__note">
          Place all {FLEET.length} ships to begin ({fleet.length}/{FLEET.length} placed).
        </p>
      )}
    </aside>
  )
}
