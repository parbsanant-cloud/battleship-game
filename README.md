# Battleship

## Project Overview

Battleship is a browser-based, single-player Battleship game against an AI
opponent. It is client-side only: there is no backend, account system, or
network dependency during play.

I built it as part of the Cognition interview process, with the emphasis on
demonstrating collaboration with Devin rather than raw code generation.

## Live Demo

- https://battleship-game-sage.vercel.app/
- https://github.com/parbsanant-cloud/battleship-game

## Features

- Manual fleet placement with hover validation preview
- Randomize and clear placement controls
- Ship rotation, including the `R` keyboard shortcut
- Easy AI
- Normal hunt/target AI
- Hit, miss, and sunk feedback with fleet-status panels
- Win and lose detection
- Enemy fleet reveal after defeat
- Play Again while preserving the selected difficulty
- Responsive layout down to 375px
- Accessibility support: `aria-label`s on cells and boards, `aria-live`
  announcements, disabled spent cells, and visible focus styles
- Reduced-motion support
- Automated Vitest suite

## Tech Stack

- React 19
- TypeScript
- Vite
- Vitest
- Vercel
- oxlint
- Plain CSS
- Node.js >= 22.12

There are no runtime dependencies beyond React and React DOM.

## Project Structure

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

## Local Development

Use Node 22.12.0, matching `.nvmrc` and the package engine requirement:

```bash
source ~/.nvm/nvm.sh
nvm use 22.12.0
npm install
npm run dev
```

The development server runs at `http://localhost:5173`.

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

The app is a static Vercel site using the Vite preset: `npm run build` emits to
`dist/`, and Vercel reads the Node version from `engines.node`. Pushes to `main`
deploy to production, pull requests get preview URLs, and no environment
variables are required.

## AI Difficulty

Easy mode fires uniformly at random among cells it has not fired at yet.

Normal mode uses hunt/target behavior. It hunts randomly until it gets a hit,
then chooses unfired orthogonal neighbours. Once two unresolved hits are
aligned, it extends along that axis, including filling an unfired interior gap.
It tracks which ships its own shots have sunk and skips hunt cells too cramped
to hold the smallest ship still afloat. When a ship sinks, only that ship's
cells are removed from unresolved-hit memory. Hits belonging to an adjacent
ship that is still afloat remain, so the AI stays in target mode.

The shot-selection function is deliberately fair:
`chooseAIShot` receives only `AIMemory` — fired indices, unresolved hits, and
the ships its own shots have sunk — plus the difficulty. It never receives the
player board or fleet, so it cannot see hidden ships.

## Architecture

Game logic lives in `src/game/` as pure TypeScript with zero React imports.
`App.tsx` owns the single `useReducer`; there is no Context layer. State and
callbacks flow down through props, and components dispatch actions back up
through callbacks. Presentational components live in `src/components/`.
Boards use flat 10×10 arrays indexed by `r * 10 + c`.

Separating rules and AI from rendering makes the rules unit-testable without a
DOM or renderer. It also keeps the AI's information boundary enforceable:
components cannot physically leak hidden ship positions because the enemy
board is masked in one place in `App.tsx` before it is rendered. Rendering is
then a pure function of state.

## Testing

There are three verification layers:

1. **Automated:** 69 Vitest tests cover board, placement, rules, reducer, and
   AI behavior. The project also runs `npm run typecheck`, `npm run lint`, and
   `npm run build`.
2. **Manual QA:** Every UI stage was browser-verified, including complete games
   to both a player win and an AI win, keyboard-only placement and firing,
   reduced-motion behavior, the 375px layout with no horizontal scroll, and an
   empty console.
3. **Production verification:** After merge, the deployed Vercel bundle was
   confirmed byte-identical to a fresh local build of `main`. Instrumented
   Normal games on the live site recorded 179 hunt shots with zero
   infeasible-cell violations and zero repeated or out-of-bounds AI shots.

## How I Used Devin

I asked Devin to plan before writing any code, and I reviewed the proposed
architecture. I intentionally cut scope to reduce unnecessary complexity; the
first plan draft was deliberately reduced.

Implementation proceeded as staged pull requests:

1. scaffold
2. types and board
3. placement
4. rules
5. reducer
6. placement UI
7. battle screen
8. hunt/target AI
9. reveal-on-defeat
10. release-candidate review

Each stage required tests before I approved it, and I reviewed every stage
manually before the next began. I applied my own judgment rather than
accepting every recommendation: I approved some proposals and rejected or
changed others. I also found the late-game AI bug myself by playing the game.

## Engineering Tradeoffs

- **Multiplayer:** It needs a server, authentication, matchmaking, and
  realtime transport, so it is outside this assignment.
- **Backend:** A local single-player match has nothing to persist or
  coordinate, so static hosting keeps deployment simple.
- **Persistence:** A match is a single sitting; resumable state would add
  migration and invalidation concerns without enough user benefit here.
- **Probability-density AI:** Hunt/target is sufficient for this assignment;
  density scoring adds complexity and makes fairness and testing harder.
- **Sound:** It conveys no gameplay information here and would require
  autoplay handling and a mute control.
- **Hard difficulty:** A third tuning profile would add balancing and testing
  work without demonstrating a different architectural capability.
- **Additional game modes:** They would expand rules, UI, and test scope beyond
  the human-versus-AI match required for this assignment.

## Known Limitations

1. Board cells are individually tabbable rather than an arrow-key grid, so
   traversing a board by keyboard takes many tab presses. Spent cells are now
   disabled and skipped to reduce that cost.
2. Normal mode assumes two aligned unresolved hits belong to one ship. Two
   adjacent ships in the same row or column can occasionally cause a
   mis-target; the AI self-corrects on the resulting miss.
3. The feasibility check applies only during hunting. Target-mode follow-up
   shots use their own hit-anchored reasoning and are not feasibility-filtered.
4. Parity and probability-density hunting remain deliberately out of scope.
5. There is no persistence, so refreshing the page restarts the game.
