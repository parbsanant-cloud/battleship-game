import { useCallback, useEffect, useMemo, useReducer, useState } from 'react'
import Board from './components/Board.tsx'
import PlacementPanel from './components/PlacementPanel.tsx'
import { FLEET, inBounds, toIndex } from './game/board.ts'
import { canPlace, shipCells } from './game/placement.ts'
import { createInitialState, gameReducer } from './game/reducer.ts'
import type { BoardPreview } from './components/Board.tsx'
import type { Coord } from './game/types.ts'

function ignoresShortcut(target: EventTarget | null): boolean {
  if (!(target instanceof HTMLElement)) return false
  if (target.isContentEditable) return true
  return ['INPUT', 'TEXTAREA', 'SELECT'].includes(target.tagName)
}

export default function App() {
  const [state, dispatch] = useReducer(gameReducer, 'normal', createInitialState)
  const [hover, setHover] = useState<Coord | null>(null)

  const { phase, playerBoard, playerFleet, selectedShipId, orientation } = state
  const placing = phase === 'placement'

  useEffect(() => {
    if (!placing) return

    function onKeyDown(event: KeyboardEvent) {
      if (event.key.toLowerCase() !== 'r') return
      if (event.ctrlKey || event.metaKey || event.altKey) return
      if (ignoresShortcut(event.target)) return
      event.preventDefault()
      dispatch({ type: 'ROTATE' })
    }

    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [placing])

  const preview = useMemo<BoardPreview | null>(() => {
    if (!placing || !hover || selectedShipId === null) return null
    const spec = FLEET.find((candidate) => candidate.id === selectedShipId)
    if (!spec) return null

    const footprint = shipCells(hover, spec.length, orientation)
    return {
      indices: new Set(footprint.filter(inBounds).map(toIndex)),
      valid: canPlace(playerBoard, hover, spec.length, orientation),
    }
  }, [placing, hover, selectedShipId, orientation, playerBoard])

  const selectCell = useCallback((origin: Coord) => dispatch({ type: 'PLACE_SHIP', origin }), [])

  return (
    <div className="app">
      <header className="app__header">
        <h1 className="app__title">Battleship</h1>
        <p className="app__tagline">Position your fleet, then take on the AI.</p>
      </header>

      <main className="layout">
        <section className="layout__board">
          <h2 className="board__title">Your waters</h2>
          <Board
            cells={playerBoard.cells}
            label="Your waters"
            interactive={placing}
            preview={preview}
            onSelectCell={selectCell}
            onHoverCell={setHover}
          />
        </section>

        {placing ? (
          <PlacementPanel
            fleet={playerFleet}
            selectedShipId={selectedShipId}
            orientation={orientation}
            difficulty={state.difficulty}
            canStart={playerFleet.length === FLEET.length}
            onSelectShip={(shipId) => dispatch({ type: 'SELECT_SHIP', shipId })}
            onRotate={() => dispatch({ type: 'ROTATE' })}
            onRandomize={() => dispatch({ type: 'RANDOMIZE' })}
            onClear={() => dispatch({ type: 'CLEAR' })}
            onStart={() => dispatch({ type: 'START' })}
            onDifficultyChange={(difficulty) => dispatch({ type: 'SET_DIFFICULTY', difficulty })}
          />
        ) : (
          <aside className="panel">
            <h2 className="panel__heading">Fleet deployed</h2>
            <p className="panel__note">
              Your ships are in position. The battle screen arrives in the next step.
            </p>
            <button
              type="button"
              className="button button--primary"
              onClick={() => dispatch({ type: 'NEW_GAME' })}
            >
              Back to placement
            </button>
          </aside>
        )}
      </main>
    </div>
  )
}
