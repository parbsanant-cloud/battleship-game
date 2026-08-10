import Board from './Board.tsx'
import type { BoardPreview, DisplayCellState } from './Board.tsx'
import FleetStatus from './FleetStatus.tsx'
import type { SunkShipOverlay } from './SunkShipSilhouette.tsx'
import { FLEET } from '../game/board.ts'
import type { Animation, Coord, GameState, ShipId } from '../game/types.ts'

interface BoardDockProps {
  fleetTitle: string
  boardLabel: string
  cells: DisplayCellState[]
  fleet: GameState['playerFleet']
  interactive: boolean
  preview: BoardPreview | null
  animatingIndex: number | null
  animatingKind: Animation['kind'] | null
  onSelectCell: (coord: Coord) => void
  onHoverCell: (coord: Coord | null) => void
  highlightShipId: ShipId | null
  variant: 'player' | 'enemy'
  scanning?: boolean
}

function sunkShips(fleet: GameState['playerFleet']): SunkShipOverlay[] {
  return fleet
    .filter((ship) => ship.hits === ship.length)
    .map(({ id, cells }) => ({ id, cells }))
}

export default function BoardDock({
  fleetTitle,
  boardLabel,
  cells,
  fleet,
  interactive,
  preview,
  animatingIndex,
  animatingKind,
  onSelectCell,
  onHoverCell,
  highlightShipId,
  variant,
  scanning = false,
}: BoardDockProps) {
  return (
    <section className={`board-dock${scanning ? ' board-dock--scanning' : ''}`}>
      <div className="board-dock__header">
        <div>
          <span className="tactical-label">{variant === 'player' ? 'Homeward waters' : 'Divine waters'}</span>
          <h2 className="board-dock__title">{fleetTitle}</h2>
        </div>
        <span className="board-dock__code">{variant === 'player' ? 'ITHACA' : 'POSEIDON'}</span>
      </div>
      {highlightShipId !== null && (
        <div className="sunk-label" aria-hidden="true">
          {FLEET.find((ship) => ship.id === highlightShipId)?.name} Sunk
        </div>
      )}
      <Board
        cells={cells}
        label={boardLabel}
        interactive={interactive}
        preview={preview}
        sunkShips={sunkShips(fleet)}
        animatingIndex={animatingIndex}
        animatingKind={animatingKind}
        onSelectCell={onSelectCell}
        onHoverCell={onHoverCell}
      />
      <FleetStatus
        title={variant === 'player' ? 'SHIPS OF ITHACA' : "POSEIDON'S FLEET"}
        ships={fleet}
        highlightShipId={highlightShipId}
        variant={variant}
      />
    </section>
  )
}
