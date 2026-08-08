import type { CSSProperties } from 'react'
import type { Coord, ShipId } from '../game/types.ts'

export interface SunkShipOverlay {
  id: ShipId
  cells: Coord[]
}

interface SunkShipSilhouetteProps {
  ship: SunkShipOverlay
}

/** Hull and superstructure paths, drawn bow-right in a `length * 100` by 100 space. */
const SHAPES: Record<ShipId, { hull: string; tower: string }> = {
  carrier: {
    hull: 'M10 70Q22 28 58 25H438Q478 27 492 62L468 90H30Q15 86 10 70Z',
    tower: 'M306 25V11H356V25L346 32H316Z',
  },
  battleship: {
    hull: 'M10 70 40 24H350Q378 27 390 58L365 90H28Q14 86 10 70Z',
    tower: 'M160 24V8H228V24L216 38H174Z',
  },
  cruiser: {
    hull: 'M12 70 42 30H255Q280 32 290 60L268 88H30Q17 84 12 70Z',
    tower: 'M124 30V14H174V30L164 42H134Z',
  },
  submarine: {
    hull: 'M12 62Q24 28 62 25H238Q276 28 288 62Q274 90 34 90Q18 84 12 62Z',
    tower: 'M132 26V10H164V26L157 34H139Z',
  },
  destroyer: {
    hull: 'M10 70 40 28H165Q184 30 192 60L174 90H26Q14 86 10 70Z',
    tower: 'M76 28V10H118V28L108 42H86Z',
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
        <path className="sunk-silhouette__detail" d={shape.tower} />
      </svg>
    </div>
  )
}
