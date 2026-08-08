import { useId, type CSSProperties } from 'react'
import type { Coord, ShipId } from '../game/types.ts'

export interface SunkShipOverlay {
  id: ShipId
  cells: Coord[]
}

interface SunkShipSilhouetteProps {
  ship: SunkShipOverlay
}

type ShapePrimitive =
  | { kind: 'path'; d: string; tone?: PrimitiveTone; weight?: PrimitiveWeight }
  | { kind: 'circle'; cx: number; cy: number; r: number; tone?: PrimitiveTone }
  | { kind: 'line'; x1: number; y1: number; x2: number; y2: number; weight?: PrimitiveWeight }
  | { kind: 'rect'; x: number; y: number; width: number; height: number; rx?: number; tone?: PrimitiveTone }

type PrimitiveTone = 'dark' | 'scorch'
type PrimitiveWeight = 'normal' | 'heavy'

interface ShipShape {
  hull: string
  structures: readonly ShapePrimitive[]
}

/** Top-down hulls and deck structures, drawn bow-right in a `length * 100` by 100 space. */
const SHAPES: Record<ShipId, ShipShape> = {
  carrier: {
    hull: 'M8 50 34 16H430L492 36V64L430 84H34Z',
    structures: [
      { kind: 'rect', x: 42, y: 29, width: 260, height: 42, tone: 'dark' },
      { kind: 'line', x1: 58, y1: 50, x2: 288, y2: 50, weight: 'heavy' },
      { kind: 'line', x1: 58, y1: 34, x2: 288, y2: 34 },
      { kind: 'line', x1: 58, y1: 66, x2: 288, y2: 66 },
      { kind: 'rect', x: 326, y: 27, width: 48, height: 23, rx: 3, tone: 'dark' },
      { kind: 'line', x1: 350, y1: 27, x2: 350, y2: 15, weight: 'heavy' },
      { kind: 'circle', cx: 184, cy: 53, r: 8, tone: 'scorch' },
    ],
  },
  battleship: {
    hull: 'M8 50 34 18H350L390 34V66L350 82H34Z',
    structures: [
      { kind: 'circle', cx: 92, cy: 50, r: 14, tone: 'dark' },
      { kind: 'line', x1: 92, y1: 50, x2: 70, y2: 50, weight: 'heavy' },
      { kind: 'rect', x: 166, y: 27, width: 66, height: 46, rx: 4, tone: 'dark' },
      { kind: 'line', x1: 199, y1: 27, x2: 199, y2: 14, weight: 'heavy' },
      { kind: 'circle', cx: 304, cy: 50, r: 14, tone: 'dark' },
      { kind: 'line', x1: 304, y1: 50, x2: 326, y2: 50, weight: 'heavy' },
      { kind: 'circle', cx: 256, cy: 65, r: 7, tone: 'scorch' },
    ],
  },
  cruiser: {
    hull: 'M10 50 38 24H250L290 38V62L250 76H38Z',
    structures: [
      { kind: 'circle', cx: 94, cy: 50, r: 12, tone: 'dark' },
      { kind: 'line', x1: 94, y1: 50, x2: 76, y2: 50, weight: 'heavy' },
      { kind: 'rect', x: 144, y: 30, width: 46, height: 40, rx: 4, tone: 'dark' },
      { kind: 'line', x1: 167, y1: 30, x2: 167, y2: 15, weight: 'heavy' },
      { kind: 'line', x1: 161, y1: 15, x2: 173, y2: 15, weight: 'heavy' },
    ],
  },
  submarine: {
    hull: 'M12 50Q26 20 64 18H236Q274 20 288 50Q274 80 236 82H64Q26 80 12 50Z',
    structures: [
      { kind: 'rect', x: 136, y: 27, width: 28, height: 22, rx: 5, tone: 'dark' },
      { kind: 'line', x1: 150, y1: 27, x2: 150, y2: 12, weight: 'heavy' },
      { kind: 'line', x1: 150, y1: 12, x2: 162, y2: 12, weight: 'heavy' },
      { kind: 'line', x1: 50, y1: 50, x2: 250, y2: 50 },
      { kind: 'circle', cx: 214, cy: 65, r: 7, tone: 'scorch' },
    ],
  },
  destroyer: {
    hull: 'M8 50 42 20H158L192 40V60L158 80H42Z',
    structures: [
      { kind: 'circle', cx: 52, cy: 50, r: 9, tone: 'dark' },
      { kind: 'line', x1: 52, y1: 50, x2: 36, y2: 50, weight: 'heavy' },
      { kind: 'rect', x: 76, y: 30, width: 46, height: 40, rx: 3, tone: 'dark' },
      { kind: 'line', x1: 99, y1: 30, x2: 99, y2: 17, weight: 'heavy' },
      { kind: 'circle', cx: 145, cy: 50, r: 6, tone: 'scorch' },
    ],
  },
}

function primitiveClass(tone?: PrimitiveTone, weight?: PrimitiveWeight) {
  return [
    'sunk-silhouette__detail',
    tone === 'dark' ? 'sunk-silhouette__detail--dark' : '',
    tone === 'scorch' ? 'sunk-silhouette__detail--scorch' : '',
    weight === 'heavy' ? 'sunk-silhouette__detail--heavy' : '',
  ]
    .filter(Boolean)
    .join(' ')
}

export default function SunkShipSilhouette({ ship }: SunkShipSilhouetteProps) {
  const clipId = `sunk-clip-${useId().replaceAll(':', '')}`
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
        <defs>
          <clipPath id={clipId}>
            <path d={shape.hull} />
          </clipPath>
        </defs>
        <path className="sunk-silhouette__hull" d={shape.hull} vectorEffect="non-scaling-stroke" />
        <g clipPath={`url(#${clipId})`}>
          {shape.structures.map((structure, index) =>
            structure.kind === 'path' ? (
              <path
                key={index}
                className={primitiveClass(structure.tone, structure.weight)}
                d={structure.d}
                vectorEffect="non-scaling-stroke"
              />
            ) : structure.kind === 'circle' ? (
              <circle
                key={index}
                className={primitiveClass(structure.tone)}
                cx={structure.cx}
                cy={structure.cy}
                r={structure.r}
                vectorEffect="non-scaling-stroke"
              />
            ) : structure.kind === 'line' ? (
              <line
                key={index}
                className={primitiveClass(undefined, structure.weight)}
                x1={structure.x1}
                y1={structure.y1}
                x2={structure.x2}
                y2={structure.y2}
                vectorEffect="non-scaling-stroke"
              />
            ) : (
              <rect
                key={index}
                className={primitiveClass(structure.tone)}
                x={structure.x}
                y={structure.y}
                width={structure.width}
                height={structure.height}
                rx={structure.rx}
                vectorEffect="non-scaling-stroke"
              />
            ),
          )}
        </g>
      </svg>
    </div>
  )
}
