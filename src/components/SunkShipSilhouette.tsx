import type { CSSProperties } from 'react'
import type { Coord, ShipId } from '../game/types.ts'

export interface SunkShipOverlay {
  id: ShipId
  cells: Coord[]
}

interface SunkShipSilhouetteProps {
  ship: SunkShipOverlay
}

type ShapePrimitive =
  | { kind: 'path'; d: string }
  | { kind: 'circle'; cx: number; cy: number; r: number }

interface ShipShape {
  hull: string
  structures: readonly ShapePrimitive[]
}

/** Top-down hulls and deck structures, drawn bow-right in a `length * 100` by 100 space. */
const SHAPES: Record<ShipId, ShipShape> = {
  carrier: {
    hull: 'M8 50 34 16H430L492 36V64L430 84H34Z',
    structures: [
      { kind: 'path', d: 'M42 29H302V71H42Z' },
      { kind: 'path', d: 'M326 28H374V49H326Z' },
    ],
  },
  battleship: {
    hull: 'M8 50 34 18H350L390 34V66L350 82H34Z',
    structures: [
      { kind: 'circle', cx: 92, cy: 50, r: 14 },
      { kind: 'path', d: 'M166 27H232V73H166Z' },
      { kind: 'circle', cx: 304, cy: 50, r: 14 },
    ],
  },
  cruiser: {
    hull: 'M10 50 38 24H250L290 38V62L250 76H38Z',
    structures: [
      { kind: 'circle', cx: 94, cy: 50, r: 12 },
      { kind: 'path', d: 'M144 30H190V70H144Z' },
    ],
  },
  submarine: {
    hull: 'M12 50Q26 20 64 18H236Q274 20 288 50Q274 80 236 82H64Q26 80 12 50Z',
    structures: [{ kind: 'path', d: 'M136 26H164V48H136Z' }],
  },
  destroyer: {
    hull: 'M8 50 42 20H158L192 40V60L158 80H42Z',
    structures: [
      { kind: 'path', d: 'M76 30H122V70H76Z' },
      { kind: 'circle', cx: 52, cy: 50, r: 9 },
    ],
  },
}

export default function SunkShipSilhouette({ ship }: SunkShipSilhouetteProps) {
  const first = ship.cells[0]
  const horizontal = ship.cells[1]?.r === first.r
  const length = ship.cells.length
  const start = horizontal
    ? { r: first.r, c: Math.min(...ship.cells.map((cell) => cell.c)) }
    : { r: Math.min(...ship.cells.map((cell) => cell.r)), c: first.c }
  const shape = SHAPES[ship.id]

  return (
    <div
      className={`sunk-silhouette${horizontal ? '' : ' sunk-silhouette--vertical'}`}
      aria-hidden="true"
      style={
        {
          '--sunk-column': start.c + 1,
          '--sunk-row': start.r + 1,
          '--sunk-length': length,
        } as CSSProperties
      }
    >
      <svg
        className="sunk-silhouette__svg"
        viewBox={`0 0 ${length * 100} 100`}
        preserveAspectRatio="none"
        aria-hidden="true"
        focusable="false"
      >
        <path className="sunk-silhouette__hull" d={shape.hull} vectorEffect="non-scaling-stroke" />
        {shape.structures.map((structure, index) =>
          structure.kind === 'path' ? (
            <path
              key={index}
              className="sunk-silhouette__detail"
              d={structure.d}
              vectorEffect="non-scaling-stroke"
            />
          ) : (
            <circle
              key={index}
              className="sunk-silhouette__detail"
              cx={structure.cx}
              cy={structure.cy}
              r={structure.r}
              vectorEffect="non-scaling-stroke"
            />
          ),
        )}
      </svg>
    </div>
  )
}
