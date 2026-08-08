import { useCallback, useEffect, useMemo, useReducer, useRef, useState } from 'react'
import {
  createCombatAudioController,
  type CombatAudioController,
  type VoiceCue,
} from './audio.ts'
import Board from './components/Board.tsx'
import BoardDock from './components/BoardDock.tsx'
import CommandRail from './components/CommandRail.tsx'
import Comms from './components/Comms.tsx'
import GameOver from './components/GameOver.tsx'
import Landing from './components/Landing.tsx'
import PlacementPanel from './components/PlacementPanel.tsx'
import { FLEET, inBounds, toIndex } from './game/board.ts'
import { chooseAIShot } from './game/ai.ts'
import { canPlace, shipCells } from './game/placement.ts'
import { createInitialState, gameReducer } from './game/reducer.ts'
import type { BoardPreview, DisplayCellState } from './components/Board.tsx'
import type { CellState, Coord, GameState, ShipId } from './game/types.ts'

function maskBoard(cells: CellState[], revealShips: boolean): DisplayCellState[] {
  return cells.map((cell) => (cell === 'ship' ? (revealShips ? 'revealed' : 'empty') : cell))
}

function ignoresShortcut(target: EventTarget | null): boolean {
  if (!(target instanceof HTMLElement)) return false
  if (target.isContentEditable) return true
  return ['INPUT', 'TEXTAREA', 'SELECT'].includes(target.tagName)
}

const SOUND_MUTED_KEY = 'battleship-sound-muted'
const VOICE_MUTED_KEY = 'battleship-voice-muted'

function readSoundMuted(): boolean {
  try {
    return window.localStorage.getItem(SOUND_MUTED_KEY) === 'true'
  } catch {
    return false
  }
}

function readVoiceMuted(): boolean {
  try {
    return window.localStorage.getItem(VOICE_MUTED_KEY) === 'true'
  } catch {
    return false
  }
}

function sinkVoiceCue(fleet: 'player' | 'ai', shipId: ShipId): VoiceCue {
  return `${fleet === 'ai' ? 'player' : 'ai'}-sink-${shipId}` as VoiceCue
}

export default function App() {
  const [state, dispatch] = useReducer(gameReducer, 'normal', createInitialState)
  const [hover, setHover] = useState<Coord | null>(null)
  const [launched, setLaunched] = useState(false)
  const [exiting, setExiting] = useState(false)
  const [soundMuted, setSoundMuted] = useState(readSoundMuted)
  const [voiceMuted, setVoiceMuted] = useState(readVoiceMuted)
  const [reportDismissed, setReportDismissed] = useState(false)
  const [sunkFeedback, setSunkFeedback] = useState<{
    shipId: ShipId
    fleet: 'player' | 'ai'
  } | null>(null)
  const launchTimer = useRef<number | null>(null)
  const sunkFeedbackTimer = useRef<number | null>(null)
  const audioRef = useRef<CombatAudioController | null>(null)
  const lastAnimationRef = useRef<string | null>(null)
  const lastVoiceAnimationRef = useRef<string | null>(null)
  const announcedWinnerRef = useRef<GameState['winner']>(null)
  const previousPhaseRef = useRef<GameState['phase']>(state.phase)
  const reportPlayAgainRef = useRef<HTMLButtonElement>(null)
  const stateRef = useRef<GameState>(state)
  stateRef.current = state

  const { phase, playerBoard, playerFleet, selectedShipId, orientation, animating } = state
  const placing = phase === 'placement'

  useEffect(() => {
    if (phase !== 'gameOver' || previousPhaseRef.current !== 'gameOver') {
      setReportDismissed(false)
    }
    previousPhaseRef.current = phase
  }, [phase])

  useEffect(() => {
    if (phase === 'gameOver' && reportDismissed) {
      reportPlayAgainRef.current?.focus()
    }
  }, [phase, reportDismissed])

  useEffect(() => {
    const audio = createCombatAudioController(readSoundMuted(), readVoiceMuted())
    audioRef.current = audio
    return () => {
      audio.dispose()
      audioRef.current = null
    }
  }, [])

  useEffect(() => {
    audioRef.current?.setMuted(soundMuted)
    try {
      window.localStorage.setItem(SOUND_MUTED_KEY, String(soundMuted))
    } catch {
      // Audio preference remains session-local when storage is unavailable.
    }
  }, [soundMuted])

  useEffect(() => {
    audioRef.current?.setVoiceMuted(voiceMuted)
    try {
      window.localStorage.setItem(VOICE_MUTED_KEY, String(voiceMuted))
    } catch {
      // Voice preference remains session-local when storage is unavailable.
    }
  }, [voiceMuted])

  useEffect(() => {
    if (animating === null) {
      lastAnimationRef.current = null
      return
    }

    const animationKey = `${animating.kind}:${animating.index}`
    if (lastAnimationRef.current === animationKey) return
    lastAnimationRef.current = animationKey

    if (animating.kind === 'miss') {
      audioRef.current?.play('miss')
    } else if (animating.kind === 'hit') {
      audioRef.current?.play('hit-impact')
      audioRef.current?.play('hit-explosion')
    } else {
      audioRef.current?.play('sunk')
    }
  }, [animating])

  useEffect(() => {
    if (animating === null) {
      lastVoiceAnimationRef.current = null
      return
    }

    const playerFired = phase === 'playerTurn' || state.winner === 'player'
    const animationKey = `${animating.kind}:${animating.index}:${playerFired ? 'player' : 'ai'}`
    if (lastVoiceAnimationRef.current === animationKey) return

    if (animating.kind === 'hit') {
      lastVoiceAnimationRef.current = animationKey
      audioRef.current?.enqueueVoice(playerFired ? 'player-hit' : 'ai-hit')
    } else if (animating.kind === 'sunk' && sunkFeedback !== null) {
      lastVoiceAnimationRef.current = `${animationKey}:${sunkFeedback.shipId}`
      audioRef.current?.enqueueVoice(sinkVoiceCue(sunkFeedback.fleet, sunkFeedback.shipId))
    }
  }, [animating, phase, state.winner, sunkFeedback])

  useEffect(() => {
    if (phase !== 'gameOver' || state.winner === null) {
      if (phase !== 'gameOver') announcedWinnerRef.current = null
      return
    }
    if (announcedWinnerRef.current === state.winner) return
    announcedWinnerRef.current = state.winner
    audioRef.current?.enqueueVoice(state.winner === 'player' ? 'victory' : 'defeat')
  }, [phase, state.winner])

  const toggleSound = useCallback(() => {
    setSoundMuted((muted) => !muted)
  }, [])

  const toggleVoice = useCallback(() => {
    setVoiceMuted((muted) => !muted)
  }, [])

  const playAgain = useCallback(() => {
    audioRef.current?.clearVoiceQueue()
    setReportDismissed(false)
    dispatch({ type: 'NEW_GAME' })
  }, [])

  const dismissReport = useCallback(() => {
    setReportDismissed(true)
  }, [])

  const showReport = useCallback(() => {
    setReportDismissed(false)
  }, [])

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

  useEffect(() => {
    if (state.toast === null) return
    const timer = window.setTimeout(() => dispatch({ type: 'DISMISS_TOAST' }), 2200)
    return () => window.clearTimeout(timer)
  }, [state.toast])

  useEffect(() => {
    if (phase === 'placement') {
      setSunkFeedback(null)
      if (sunkFeedbackTimer.current !== null) {
        window.clearTimeout(sunkFeedbackTimer.current)
        sunkFeedbackTimer.current = null
      }
      return
    }
    if (animating?.kind !== 'sunk') return

    const playerFired = phase === 'playerTurn' || state.winner === 'player'
    const board = playerFired ? state.aiBoard : state.playerBoard
    const shipId = board.shipAt[animating.index]
    if (shipId === null) return

    setSunkFeedback({ shipId, fleet: playerFired ? 'ai' : 'player' })
    if (sunkFeedbackTimer.current !== null) window.clearTimeout(sunkFeedbackTimer.current)
    sunkFeedbackTimer.current = window.setTimeout(() => {
      setSunkFeedback(null)
      sunkFeedbackTimer.current = null
    }, 1500)
  }, [animating?.index, animating?.kind, phase, state.aiBoard, state.playerBoard, state.winner])

  useEffect(() => {
    return () => {
      if (launchTimer.current !== null) window.clearTimeout(launchTimer.current)
      if (sunkFeedbackTimer.current !== null) window.clearTimeout(sunkFeedbackTimer.current)
    }
  }, [])

  const startMission = useCallback(() => {
    if (exiting || launched) return
    setExiting(true)
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    launchTimer.current = window.setTimeout(
      () => {
        setLaunched(true)
        setExiting(false)
        launchTimer.current = null
      },
      reducedMotion ? 0 : 300,
    )
  }, [exiting, launched])

  const scanning = phase === 'aiTurn' && animating === null

  const animatedPlayerBoard =
    animating !== null && (phase === 'aiTurn' || state.winner === 'ai')
  const animatedEnemyBoard =
    animating !== null && (phase === 'playerTurn' || state.winner === 'player')

  if (!launched) {
    return (
      <div className="app app--landing">
        <Landing
          difficulty={state.difficulty}
          exiting={exiting}
          soundMuted={soundMuted}
          voiceMuted={voiceMuted}
          onDifficultyChange={(difficulty) => dispatch({ type: 'SET_DIFFICULTY', difficulty })}
          onStartMission={startMission}
          onToggleSound={toggleSound}
          onToggleVoice={toggleVoice}
        />
      </div>
    )
  }

  return (
    <div className="app app--command">
      <CommandRail
        phase={phase}
        winner={state.winner}
        difficulty={state.difficulty}
        stats={state.stats}
        soundMuted={soundMuted}
        voiceMuted={voiceMuted}
        showGameOverActions={phase === 'gameOver'}
        playAgainRef={reportPlayAgainRef}
        onToggleSound={toggleSound}
        onToggleVoice={toggleVoice}
        onShowReport={showReport}
        onPlayAgain={playAgain}
      />
      {placing ? (
        <main className="deployment-screen screen-enter">
          <section className="deployment-screen__board">
            <div className="screen-heading">
              <span className="tactical-label">Deployment grid</span>
              <h2>Your waters</h2>
              <p>Assign positions for the task group.</p>
            </div>
            <Board
              cells={playerBoard.cells}
              label="Your waters"
              interactive={placing}
              preview={preview}
              sunkShips={[]}
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
        <main className="combat-screen screen-enter">
          <div className="combat-screen__boards">
            <BoardDock
              fleetTitle="Your fleet"
              boardLabel="Your fleet"
              cells={playerBoard.cells}
              fleet={state.playerFleet}
              interactive={false}
              preview={null}
              animatingIndex={animatedPlayerBoard ? animating?.index ?? null : null}
              animatingKind={animatedPlayerBoard ? animating?.kind ?? null : null}
              onSelectCell={() => {}}
              onHoverCell={() => {}}
              highlightShipId={sunkFeedback?.fleet === 'player' ? sunkFeedback.shipId : null}
              variant="player"
              scanning={scanning}
            />
            <BoardDock
              fleetTitle="Enemy waters"
              boardLabel="Enemy waters"
              cells={maskBoard(state.aiBoard.cells, phase === 'gameOver' && state.winner === 'ai')}
              fleet={state.aiFleet}
              interactive={phase === 'playerTurn' && animating === null}
              preview={null}
              animatingIndex={animatedEnemyBoard ? animating?.index ?? null : null}
              animatingKind={animatedEnemyBoard ? animating?.kind ?? null : null}
              onSelectCell={(coord) => dispatch({ type: 'PLAYER_FIRE', coord })}
              onHoverCell={() => {}}
              highlightShipId={sunkFeedback?.fleet === 'ai' ? sunkFeedback.shipId : null}
              variant="enemy"
            />
          </div>
          <Comms entries={state.battleLog} message={state.message} phase={phase} winner={state.winner} />
          {phase === 'gameOver' && state.winner !== null && !reportDismissed && (
            <GameOver
              winner={state.winner}
              stats={state.stats}
              difficulty={state.difficulty}
              playerShipsRemaining={state.playerFleet.filter((ship) => ship.hits < ship.length).length}
              aiShipsRemaining={state.aiFleet.filter((ship) => ship.hits < ship.length).length}
              onDismiss={dismissReport}
              onPlayAgain={playAgain}
            />
          )}
        </main>
      )}
    </div>
  )
}
