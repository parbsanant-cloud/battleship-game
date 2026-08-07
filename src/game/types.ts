export interface Coord {
  r: number
  c: number
}

export type Orientation = 'H' | 'V'

export type Player = 'player' | 'ai'

export type ShipId = 'carrier' | 'battleship' | 'cruiser' | 'submarine' | 'destroyer'

export type CellState = 'empty' | 'ship' | 'hit' | 'miss' | 'sunk'

export interface Ship {
  id: ShipId
  name: string
  length: number
  cells: Coord[]
  hits: number
}

/** Flat arrays of length CELL_COUNT, indexed by `r * BOARD_SIZE + c`. */
export interface Board {
  cells: CellState[]
  shipAt: (ShipId | null)[]
}

export type Phase = 'placement' | 'playerTurn' | 'aiTurn' | 'gameOver'

export type Difficulty = 'easy' | 'normal'

/** What the AI knows: where it has fired and what shot results told it, including sunk ships. */
export interface AIMemory {
  fired: Set<number>
  hits: Coord[]
  sunk: ShipId[]
}

export interface Stats {
  playerShots: number
  playerHits: number
  aiShots: number
  aiHits: number
}

export interface Animation {
  index: number
  kind: 'hit' | 'miss' | 'sunk'
}

export interface GameState {
  phase: Phase
  difficulty: Difficulty
  /** Player's ships plus the AI's shots against them. */
  playerBoard: Board
  /** AI's ships plus the player's shots against them. */
  aiBoard: Board
  playerFleet: Ship[]
  aiFleet: Ship[]
  ai: AIMemory
  selectedShipId: ShipId | null
  orientation: Orientation
  message: string
  stats: Stats
  animating: Animation | null
  winner: Player | null
}

export type Action =
  | { type: 'SELECT_SHIP'; shipId: ShipId }
  | { type: 'ROTATE' }
  | { type: 'PLACE_SHIP'; origin: Coord }
  | { type: 'RANDOMIZE' }
  | { type: 'CLEAR' }
  | { type: 'SET_DIFFICULTY'; difficulty: Difficulty }
  | { type: 'START' }
  | { type: 'PLAYER_FIRE'; coord: Coord }
  | { type: 'AI_FIRE'; coord: Coord }
  | { type: 'ANIMATION_DONE' }
  | { type: 'NEW_GAME' }
