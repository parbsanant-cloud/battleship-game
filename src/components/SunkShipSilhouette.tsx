import { useId, type CSSProperties, type ReactNode } from 'react'
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
  | {
      kind: 'rect'
      x: number
      y: number
      width: number
      height: number
      rx?: number
      tone?: PrimitiveTone
    }

type PrimitiveTone = 'dark' | 'scorch'
type PrimitiveWeight = 'normal' | 'heavy'

interface ShipShape {
  hull: string
  structures: readonly ShapePrimitive[]
}

/** Top-down wooden hulls, drawn bow-right in a `length * 100` by 100 space. */
const SHAPES: Record<ShipId, ShipShape> = {
  carrier: {
    hull: 'M8 50 48 27 420 31 492 50 420 69 48 73Z',
    structures: [
      { kind: 'line', x1: 62, y1: 34, x2: 405, y2: 38 },
      { kind: 'line', x1: 62, y1: 66, x2: 405, y2: 62 },
      { kind: 'line', x1: 76, y1: 34, x2: 56, y2: 14 },
      { kind: 'line', x1: 114, y1: 32, x2: 96, y2: 12 },
      { kind: 'line', x1: 152, y1: 32, x2: 136, y2: 12 },
      { kind: 'line', x1: 190, y1: 32, x2: 176, y2: 12 },
      { kind: 'line', x1: 228, y1: 32, x2: 216, y2: 12 },
      { kind: 'line', x1: 266, y1: 32, x2: 256, y2: 12 },
      { kind: 'line', x1: 304, y1: 32, x2: 296, y2: 12 },
      { kind: 'line', x1: 342, y1: 34, x2: 336, y2: 14 },
      { kind: 'line', x1: 76, y1: 66, x2: 56, y2: 86 },
      { kind: 'line', x1: 114, y1: 68, x2: 96, y2: 88 },
      { kind: 'line', x1: 152, y1: 68, x2: 136, y2: 88 },
      { kind: 'line', x1: 190, y1: 68, x2: 176, y2: 88 },
      { kind: 'line', x1: 228, y1: 68, x2: 216, y2: 88 },
      { kind: 'line', x1: 266, y1: 68, x2: 256, y2: 88 },
      { kind: 'line', x1: 304, y1: 68, x2: 296, y2: 88 },
      { kind: 'rect', x: 190, y: 37, width: 56, height: 26, rx: 4, tone: 'dark' },
      { kind: 'line', x1: 218, y1: 37, x2: 218, y2: 10, weight: 'heavy' },
      { kind: 'line', x1: 218, y1: 10, x2: 252, y2: 18 },
      { kind: 'circle', cx: 377, cy: 50, r: 7, tone: 'scorch' },
    ],
  },
  battleship: {
    hull: 'M8 50 48 29 340 33 392 50 340 67 48 71Z',
    structures: [
      { kind: 'line', x1: 78, y1: 35, x2: 58, y2: 15 },
      { kind: 'line', x1: 120, y1: 34, x2: 102, y2: 14 },
      { kind: 'line', x1: 162, y1: 34, x2: 146, y2: 14 },
      { kind: 'line', x1: 204, y1: 34, x2: 190, y2: 14 },
      { kind: 'line', x1: 246, y1: 34, x2: 234, y2: 14 },
      { kind: 'line', x1: 288, y1: 35, x2: 278, y2: 16 },
      { kind: 'line', x1: 78, y1: 65, x2: 58, y2: 85 },
      { kind: 'line', x1: 120, y1: 66, x2: 102, y2: 86 },
      { kind: 'line', x1: 162, y1: 66, x2: 146, y2: 86 },
      { kind: 'line', x1: 204, y1: 66, x2: 190, y2: 86 },
      { kind: 'line', x1: 246, y1: 66, x2: 234, y2: 86 },
      { kind: 'line', x1: 288, y1: 65, x2: 278, y2: 84 },
      { kind: 'rect', x: 164, y: 38, width: 58, height: 24, rx: 4, tone: 'dark' },
      { kind: 'line', x1: 193, y1: 38, x2: 193, y2: 13, weight: 'heavy' },
      { kind: 'circle', cx: 326, cy: 50, r: 6, tone: 'scorch' },
    ],
  },
  cruiser: {
    hull: 'M10 50 46 31 254 35 290 50 254 65 46 69Z',
    structures: [
      { kind: 'line', x1: 74, y1: 36, x2: 58, y2: 16 },
      { kind: 'line', x1: 114, y1: 35, x2: 100, y2: 15 },
      { kind: 'line', x1: 154, y1: 35, x2: 142, y2: 15 },
      { kind: 'line', x1: 194, y1: 35, x2: 184, y2: 16 },
      { kind: 'line', x1: 74, y1: 64, x2: 58, y2: 84 },
      { kind: 'line', x1: 114, y1: 65, x2: 100, y2: 85 },
      { kind: 'line', x1: 154, y1: 65, x2: 142, y2: 85 },
      { kind: 'line', x1: 194, y1: 65, x2: 184, y2: 84 },
      { kind: 'rect', x: 132, y: 39, width: 40, height: 22, rx: 4, tone: 'dark' },
      { kind: 'line', x1: 152, y1: 39, x2: 152, y2: 14, weight: 'heavy' },
      { kind: 'circle', cx: 238, cy: 50, r: 5, tone: 'scorch' },
    ],
  },
  submarine: {
    hull: 'M12 50 44 34 242 37 288 50 242 63 44 66Z',
    structures: [
      { kind: 'line', x1: 76, y1: 38, x2: 62, y2: 18 },
      { kind: 'line', x1: 116, y1: 37, x2: 104, y2: 17 },
      { kind: 'line', x1: 156, y1: 37, x2: 146, y2: 17 },
      { kind: 'line', x1: 196, y1: 37, x2: 188, y2: 18 },
      { kind: 'line', x1: 76, y1: 62, x2: 62, y2: 82 },
      { kind: 'line', x1: 116, y1: 63, x2: 104, y2: 83 },
      { kind: 'line', x1: 156, y1: 63, x2: 146, y2: 83 },
      { kind: 'line', x1: 196, y1: 63, x2: 188, y2: 82 },
      { kind: 'rect', x: 130, y: 40, width: 32, height: 20, rx: 4, tone: 'dark' },
      { kind: 'line', x1: 146, y1: 40, x2: 146, y2: 15, weight: 'heavy' },
      { kind: 'circle', cx: 232, cy: 50, r: 5, tone: 'scorch' },
    ],
  },
  destroyer: {
    hull: 'M8 50 44 37 156 40 192 50 156 60 44 63Z',
    structures: [
      { kind: 'line', x1: 76, y1: 40, x2: 62, y2: 20 },
      { kind: 'line', x1: 112, y1: 40, x2: 100, y2: 20 },
      { kind: 'line', x1: 76, y1: 60, x2: 62, y2: 80 },
      { kind: 'line', x1: 112, y1: 60, x2: 100, y2: 80 },
      { kind: 'rect', x: 92, y: 42, width: 24, height: 16, rx: 3, tone: 'dark' },
      { kind: 'circle', cx: 144, cy: 50, r: 4, tone: 'scorch' },
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

function isOar(structure: ShapePrimitive): boolean {
  return (
    structure.kind === 'line' &&
    Math.abs(structure.x2 - structure.x1) > 4 &&
    Math.abs(structure.x2 - structure.x1) <= 24 &&
    (structure.y1 < 30 || structure.y2 < 30 || structure.y1 > 70 || structure.y2 > 70)
  )
}

function renderPrimitive(structure: ShapePrimitive, index: number): ReactNode {
  const className = primitiveClass(
    'tone' in structure ? structure.tone : undefined,
    'weight' in structure ? structure.weight : undefined,
  )

  if (structure.kind === 'path') {
    return (
      <path
        key={index}
        className={className}
        d={structure.d}
        vectorEffect="non-scaling-stroke"
      />
    )
  }
  if (structure.kind === 'circle') {
    return (
      <circle
        key={index}
        className={className}
        cx={structure.cx}
        cy={structure.cy}
        r={structure.r}
        vectorEffect="non-scaling-stroke"
      />
    )
  }
  if (structure.kind === 'line') {
    return (
      <line
        key={index}
        className={className}
        x1={structure.x1}
        y1={structure.y1}
        x2={structure.x2}
        y2={structure.y2}
        vectorEffect="non-scaling-stroke"
      />
    )
  }
  return (
    <rect
      key={index}
      className={className}
      x={structure.x}
      y={structure.y}
      width={structure.width}
      height={structure.height}
      rx={structure.rx}
      vectorEffect="non-scaling-stroke"
    />
  )
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
        <g>{shape.structures.filter(isOar).map(renderPrimitive)}</g>
        <g clipPath={`url(#${clipId})`}>
          {shape.structures.filter((structure) => !isOar(structure)).map(renderPrimitive)}
        </g>
      </svg>
    </div>
  )
}
