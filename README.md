# battleship-game

Human vs AI Battleship game. Client-side only — no backend, no database.

## Tech Stack

- React 19 + TypeScript
- Vite (build + dev server)
- Vitest (game-logic unit tests)
- oxlint
- Plain CSS

Game rules and AI live in `src/game/` as pure TypeScript with no React imports; `src/components/` renders state and dispatches actions.

## Requirements

Node >= 22.12 (see `.nvmrc`).

## Running Locally

```bash
nvm use          # or install Node 22.12+
npm install
npm run dev      # http://localhost:5173
```

## Scripts

| Command | Description |
| --- | --- |
| `npm run dev` | Dev server with hot reload |
| `npm run build` | Typecheck + production build to `dist/` |
| `npm run preview` | Serve the production build locally |
| `npm run typecheck` | `tsc -b --noEmit` |
| `npm run lint` | oxlint |
| `npm test` | Run the Vitest suite once |
| `npm run test:watch` | Vitest in watch mode |

## Deployment (Vercel)

Static site, no environment variables required.

1. Import the repository at [vercel.com/new](https://vercel.com/new).
2. Framework preset: **Vite** (auto-detected).
3. Build command `npm run build`, output directory `dist`.
4. Node version is taken from `engines.node` in `package.json`.

Pushes to `main` deploy to production; pull requests get preview URLs.

## Live Demo

(URL TBD)
