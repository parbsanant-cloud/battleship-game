# Battleship

## Project overview

Battleship is a browser-based, single-player Battleship game. A human places a
fleet and plays against an AI opponent. The application is client-side only:
there is no backend, account system, database, or network dependency during
play.

## Links

- **Live demo:** https://battleship-game-sage.vercel.app/
- **GitHub repository:** https://github.com/parbsanant-cloud/battleship-game

## Features

- Manual fleet placement with hover validation preview
- Ship rotation, including the `R` keyboard shortcut
- Randomize and clear placement controls
- Turn-based firing with hit, miss, and sunk feedback
- Player and enemy fleet-status panels
- Win and lose detection
- Enemy fleet reveal after defeat
- Play Again, preserving the selected difficulty
- Responsive layout down to 375px
- Reduced-motion support for board animations

## Easy vs Normal AI

Easy mode fires uniformly at random among cells it has not fired at yet.

Normal mode uses hunt/target behavior. It hunts randomly until it gets a hit,
then chooses unfired orthogonal neighbours. Once two unresolved hits are
aligned, it extends along that axis, including filling an unfired interior gap.
When a ship sinks, only that ship's cells are removed from unresolved-hit
memory. Hits belonging to an adjacent ship that is still afloat remain, so the
AI stays in target mode.

The shot-selection function is deliberately fair: `chooseAIShot` receives only
`AIMemory` (fired indices and unresolved hit coordinates) and the difficulty.
It never receives the player's board or fleet, so it cannot see hidden ships.

## Tech stack

- React 19
- TypeScript
- Vite
- Vitest
- oxlint
- Plain CSS
- Node.js >= 22.12

There is no backend and no dependency beyond React and the React DOM runtime.

## Local setup

Use Node 22.12.0, matching `.nvmrc` and the package engine requirement:

```bash
source ~/.nvm/nvm.sh
nvm use 22.12.0
npm install
npm run dev
```

The development server runs at `http://localhost:5173`.

## Test and development commands

| Command | Description |
| --- | --- |
| `npm run dev` | Dev server with hot reload |
| `npm run build` | Typecheck + production build to `dist/` |
| `npm run preview` | Serve the production build locally |
| `npm run typecheck` | `tsc -b --noEmit` |
| `npm run lint` | oxlint |
| `npm test` | Run the Vitest suite once |
| `npm run test:watch` | Vitest in watch mode |

## Deployment

The app is deployed as a static Vercel site using the Vite preset. The
production build is created with `npm run build` and emitted to `dist/`.
Vercel reads the Node version from `engines.node` in `package.json`.

Pushes to `main` deploy to production, and pull requests receive preview URLs.
No environment variables are required.

## Project structure

```text
src/
├── App.tsx                 # Single useReducer owner; renders state and dispatches actions
├── components/             # Presentational board, placement, status, and game-over UI
│   ├── Board.tsx
│   ├── Cell.tsx
│   ├── FleetStatus.tsx
│   ├── GameOver.tsx
│   ├── PlacementPanel.tsx
│   └── StatusBar.tsx
├── game/                   # Pure TypeScript game boundary; no React imports
│   ├── types.ts            # Domain types and reducer actions
│   ├── board.ts            # 10×10 coordinates, indices, and board construction
│   ├── placement.ts        # Placement validation and fleet generation
│   ├── rules.ts            # Shot resolution and fleet destruction
│   ├── ai.ts               # Easy and Normal shot selection/memory updates
│   └── reducer.ts          # State transitions
└── styles.css              # Naval theme and responsive layout
```

`App.tsx` owns the single `useReducer`; there is no Context layer. Components
receive state and callbacks through props and dispatch actions through App.
Boards use flat 10×10 arrays indexed by `r * 10 + c`.

## How I used Devin

I wrote an implementation plan and had it reviewed before writing code. The
plan was deliberately cut down from the first draft to a scope deliverable in
a few hours. I implemented the project in nine reviewed stages:

1. scaffold
2. types and board
3. placement
4. rules
5. reducer
6. placement UI
7. battle screen
8. hunt/target AI
9. reveal-on-defeat

This release-candidate review follows those stages. I used one pull request
per stage, and a human reviewed and explicitly approved each stage before the
next began. I added unit tests for game logic and browser-verified every UI
stage. Before coding each stage, I asked and resolved design questions such as
function signatures, state shape, and implementation tradeoffs.

## Engineering tradeoffs

- **Backend:** There is nothing to persist or coordinate in a local
  single-player match, so static hosting keeps deployment trivial.
- **Multiplayer:** Multiplayer would require a server, authentication,
  matchmaking, and realtime transport. That is a different project.
- **Persistence/localStorage:** A match is intended to be one sitting.
  Resumable state would add migration and invalidation concerns without user
  gain for this scope.
- **Probability-density AI:** Hunt/target already plays convincingly.
  Density scoring is substantially harder to test and keep provably fair, and
  could produce an opponent that is less fun to play.
- **Sound:** Sound conveys no gameplay information here and would require
  autoplay handling plus a mute control.
- **Further polish:** A keyboard-navigable board grid with roving tabindex,
  animations beyond hit/miss/sunk, and theming were deliberately traded for
  reliability and test coverage in the available time.

## Known limitations

1. Board cells are individually tabbable rather than an arrow-key grid, so
   traversing a board by keyboard takes many tab presses. Spent cells are now
   disabled and skipped to reduce that cost.
2. Normal mode assumes two aligned unresolved hits belong to one ship. Two
   adjacent ships in the same row or column can occasionally cause a
   mis-target; the AI self-corrects on the resulting miss.
3. There is no persistence, so refreshing the page restarts the game.
