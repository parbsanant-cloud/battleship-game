import { Fragment } from 'react'
import { BOARD_SIZE, toCoord } from '../game/board.ts'
import Cell from './Cell.tsx'
import type { CellState, Coord } from '../game/types.ts'

const COLUMN_LABELS = Array.from({ length: BOARD_SIZE }, (_, i) => String.fromCharCode(65 + i))
const ROW_LABELS = Array.from({ length: BOARD_SIZE }, (_, i) => String(i + 1))

function coordLabel({ r, c }: Coord): string {
  return `${COLUMN_LABELS[c]}${ROW_LABELS[r]}`
}

export interface BoardPreview {
  indices: Set<number>
  valid: boolean
}

interface BoardProps {
  cells: CellState[]
  label: string
  interactive: boolean
  preview: BoardPreview | null
  onSelectCell: (coord: Coord) => void
  onHoverCell: (coord: Coord | null) => void
}

export default function Board({
  cells,
  label,
  interactive,
  preview,
  onSelectCell,
  onHoverCell,
}: BoardProps) {
  return (
    <div className="board" role="group" aria-label={label}>
      <div className="board__label" aria-hidden="true" />
      {COLUMN_LABELS.map((column) => (
        <div key={column} className="board__label" aria-hidden="true">
          {column}
        </div>
      ))}
      {cells.map((state, index) => {
        const coord = toCoord(index)
        const previewKind = preview?.indices.has(index)
          ? preview.valid
            ? 'valid'
            : 'invalid'
          : null

        return (
          <Fragment key={index}>
            {coord.c === 0 && (
              <div className="board__label" aria-hidden="true">
                {ROW_LABELS[coord.r]}
              </div>
            )}
            <Cell
              coord={coord}
              state={state}
              label={coordLabel(coord)}
              preview={previewKind}
              interactive={interactive}
              onSelect={onSelectCell}
              onHover={onHoverCell}
            />
          </Fragment>
        )
      })}
    </div>
  )
}
