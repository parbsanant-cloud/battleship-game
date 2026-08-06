import { useCallback, useEffect, useMemo, useReducer, useRef, useState } from 'react'
import Board from './components/Board.tsx'
import FleetStatus from './components/FleetStatus.tsx'
import GameOver from './components/GameOver.tsx'
import PlacementPanel from './components/PlacementPanel.tsx'
import StatusBar from './components/StatusBar.tsx'
import { FLEET, inBounds, toIndex } from './game/board.ts'
import { chooseAIShot } from './game/ai.ts'
import { canPlace, shipCells } from './game/placement.ts'
import { createInitialState, gameReducer } from './game/reducer.ts'
import type { BoardPreview } from './components/Board.tsx'
import type { CellState, Coord, GameState } from './game/types.ts'

function maskBoard(cells: CellState[]): CellState[] {
  return cells.map((cell) => (cell === 'ship' ? 'empty' : cell))
}

function ignoresShortcut(target: EventTarget | null): boolean {
  if (!(target instanceof HTMLElement)) return false
  if (target.isContentEditable) return true
  return ['INPUT', 'TEXTAREA', 'SELECT'].includes(target.tagName)
}

export default function App() {
  const [state, dispatch] = useReducer(gameReducer, 'normal', createInitialState)
  const [hover, setHover] = useState<Coord | null>(null)
  const stateRef = useRef<GameState>(state)
  stateRef.current = state

  const { phase, playerBoard, playerFleet, selectedShipId, orientation, animating } = state
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

  useEffect(() => {
    if (phase !== 'aiTurn' || animating !== null) return

    const currentState = stateRef.current
    const coord = chooseAIShot(currentState.ai, currentState.difficulty)
    const timer = window.setTimeout(() => {
      dispatch({ type: 'AI_FIRE', coord })
    }, 700)
    return () => window.clearTimeout(timer)
  }, [phase, animating])

  useEffect(() => {
    if (animating === null) return

    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const timer = window.setTimeout(
      () => dispatch({ type: 'ANIMATION_DONE' }),
      reducedMotion ? 0 : 450,
    )
    return () => window.clearTimeout(timer)
  }, [animating])

  const animatedPlayerBoard =
    animating !== null && (phase === 'aiTurn' || state.winner === 'ai')
  const animatedEnemyBoard =
    animating !== null && (phase === 'playerTurn' || state.winner === 'player')

  return (
    <div className="app">
      <header className="app__header">
        <h1 className="app__title">Battleship</h1>
        <p className="app__tagline">Position your fleet, then take on the AI.</p>
      </header>

      {placing ? (
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
        </main>
      ) : (
        <main className="battle-screen">
          <StatusBar phase={phase} message={state.message} winner={state.winner} />
          <div className="battle-screen__boards">
            <section className="battle-screen__board">
              <h2 className="board__title">Your fleet</h2>
              <Board
                cells={playerBoard.cells}
                label="Your fleet"
                interactive={false}
                preview={null}
                animatingIndex={animatedPlayerBoard ? animating?.index : null}
                animatingKind={animatedPlayerBoard ? animating?.kind : null}
                onSelectCell={() => {}}
                onHoverCell={() => {}}
              />
            </section>
            <section className="battle-screen__board">
              <h2 className="board__title">Enemy waters</h2>
              <Board
                cells={maskBoard(state.aiBoard.cells)}
                label="Enemy waters"
                interactive={phase === 'playerTurn' && animating === null}
                preview={null}
                animatingIndex={animatedEnemyBoard ? animating?.index : null}
                animatingKind={animatedEnemyBoard ? animating?.kind : null}
                onSelectCell={(coord) => dispatch({ type: 'PLAYER_FIRE', coord })}
                onHoverCell={() => {}}
              />
            </section>
          </div>
          <div className="battle-screen__fleets">
            <FleetStatus title="Your fleet status" ships={state.playerFleet} reveal />
            <FleetStatus title="Enemy fleet status" ships={state.aiFleet} reveal={false} />
          </div>
          {phase === 'gameOver' && state.winner !== null && (
            <GameOver
              winner={state.winner}
              stats={state.stats}
              onPlayAgain={() => dispatch({ type: 'NEW_GAME' })}
            />
          )}
        </main>
      )}
    </div>
  )
}
