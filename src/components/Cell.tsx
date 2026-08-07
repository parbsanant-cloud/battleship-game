import type { Animation, Coord } from '../game/types.ts'
import type { DisplayCellState } from './Board.tsx'

type CellPreview = 'valid' | 'invalid' | null

interface CellProps {
  coord: Coord
  state: DisplayCellState
  label: string
  preview: CellPreview
  interactive: boolean
  animating: Animation['kind'] | null
  onSelect: (coord: Coord) => void
  onHover: (coord: Coord | null) => void
}

const STATE_DESCRIPTION: Record<DisplayCellState, string> = {
  empty: 'water',
  ship: 'your ship',
  hit: 'hit',
  miss: 'miss',
  sunk: 'sunk',
  revealed: 'enemy ship revealed after defeat',
}

const RESOLVED_STATES = new Set<DisplayCellState>(['hit', 'miss', 'sunk', 'revealed'])

export default function Cell({
  coord,
  state,
  label,
  preview,
  interactive,
  animating,
  onSelect,
  onHover,
}: CellProps) {
  const classes = ['cell', `cell--${state}`]
  if (preview) classes.push(`cell--preview-${preview}`)
  if (animating) classes.push(`cell--anim-${animating}`)

  return (
    <button
      type="button"
      className={classes.join(' ')}
      disabled={!interactive || RESOLVED_STATES.has(state)}
      aria-label={`${label}, ${STATE_DESCRIPTION[state]}`}
      onClick={() => onSelect(coord)}
      onMouseEnter={() => onHover(coord)}
      onMouseLeave={() => onHover(null)}
      onFocus={() => onHover(coord)}
      onBlur={() => onHover(null)}
    />
  )
}
