import type { Animation, CellState, Coord } from '../game/types.ts'

export type CellPreview = 'valid' | 'invalid' | null

interface CellProps {
  coord: Coord
  state: CellState
  label: string
  preview: CellPreview
  interactive: boolean
  animating: Animation['kind'] | null
  onSelect: (coord: Coord) => void
  onHover: (coord: Coord | null) => void
}

const STATE_DESCRIPTION: Record<CellState, string> = {
  empty: 'water',
  ship: 'your ship',
  hit: 'hit',
  miss: 'miss',
  sunk: 'sunk',
}

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
      disabled={!interactive}
      aria-label={`${label}, ${STATE_DESCRIPTION[state]}`}
      onClick={() => onSelect(coord)}
      onMouseEnter={() => onHover(coord)}
      onMouseLeave={() => onHover(null)}
      onFocus={() => onHover(coord)}
      onBlur={() => onHover(null)}
    />
  )
}
