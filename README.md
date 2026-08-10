# NOSTOS

### A game of war, fate, and the long voyage home.

NOSTOS is Battleship reimagined as a mythic voyage. A fleet that survived ten
years of war is returning to Ithaca, but the sea is ruled by Poseidon's wrath.
Place the vessels, cross the wine-dark water, and find a way home before the
last mast disappears beneath it.

## Live Demo

- **Play NOSTOS:** <https://battleship-game-sage.vercel.app/>
- **Repository:** <https://github.com/parbsanant-cloud/battleship-game>

## The Experience

The game begins with a quiet briefing and a fleet waiting to be placed. Once
the crossing starts, two chart-like boards frame the voyage: **YOUR FLEET**
marks the homeward waters and **POSEIDON'S WATERS** hides the enemy fleet. The
Chronicle and OMENS & VOICES feed turn shots into a small running story.

The presentation was built in iterations rather than added as a single theme
pass. The core game came first; repeated play, rendered review, and user
critique then shaped the NOSTOS copy, vessel names, boards, sunk silhouettes,
audio, responsive layout, and the Odyssey backdrop.

## Gameplay

### Placement

Place five vessels on the 10×10 board. The selected ship shows a valid or
invalid footprint preview, `R` rotates the selected ship, and **Randomize** and
**Clear** support faster setup. Ships may touch; they may not overlap or leave
the board. The crossing begins once all five are placed.

### Firing

During your turn, choose an unfired cell on Poseidon's board. A shot becomes a
hit, miss, or sunk result, and the AI answers with its own shot. Resolved cells
are disabled so an already-used coordinate cannot be fired again.

### Hits, misses, and sinking

Hits use a filled ember/scorched-timber treatment, misses use pale foam, and
sunk footprints become disturbed dark water beneath a top-down wooden galley
silhouette. On defeat, the surviving enemy ships are revealed. Fleet panels
track each vessel as `READY`, `OPERATIONAL`, `DAMAGED`, `CRITICAL`, or
`DESTROYED`.

### Two seas

- **Mortal Seas** is the Easy mode: Poseidon fires randomly at cells he has not
  tried.
- **Wrath of Poseidon** is Normal mode: the god hunts until he finds a hit,
  targets orthogonal neighbours, and follows an aligned run when multiple
  unresolved hits reveal a direction.

### Victory and defeat

Sink the opposing fleet to reach Ithaca. If Poseidon sinks yours first, the
storm closes over the last mast. The final account can be dismissed so the
finished boards and the revealed enemy fleet remain inspectable, and **SAIL
AGAIN** starts a fresh match with the selected difficulty preserved.

## What Makes NOSTOS Different

NOSTOS keeps the deterministic rules of Battleship but changes the frame
around them. The UI speaks in terms of a crossing, homeward waters, offerings,
omens, and Ithaca rather than a modern tactical command. The boards remain
functional charts: bronze-edged dark timber marks a living vessel, ember marks
damage, and the galley itself explains a sinking instead of a bright bounding
box.

Behind the game is a hand-drawn night sea made from CSS layers and inline SVG:
moonlit Aegean water, route marks, storms, Cyclops, Sirens, Scylla,
Charybdis, and a distant Ithaca. Landmarks sit in margins and page gaps rather
than over the cells. Motion is restrained and disabled for reduced-motion
users.

## Architecture

- **React 19, TypeScript, Vite, Vitest, plain CSS, and Vercel.** Node
  `>=22.12` is required. There are no added runtime dependencies beyond React
  and React DOM.
- **Pure game boundary.** `src/game/` has no React imports. Board helpers,
  placement, rules, AI memory, and reducer transitions are pure TypeScript
  concerns.
- **Single state owner.** `App.tsx` owns the `useReducer` and passes state and
  callbacks through presentational components. `Board`, `Cell`, `BoardDock`,
  `FleetStatus`, `Comms`, `GameOver`, and placement components render the
  experience. `WorldBackdrop` is a separate, pointer-free presentation layer.
- **Information boundary.** Before rendering, `App.tsx` masks enemy ship cells
  until defeat. The AI receives only its own memory, not the player's hidden
  board.

Boards use flat 10×10 arrays indexed by `r * 10 + c`; the UI adds A–J and
1–10 coordinate labels. Sunk overlays use the same cell, gap, and board-pad
geometry as the grid.

## AI Opponent

Easy, shown as **Mortal Seas**, chooses uniformly from cells it has not fired
at. It has no access to hidden ship positions.

Normal, shown as **Wrath of Poseidon**, uses hunt/target behavior:

1. It hunts among unfired cells that can still accommodate the smallest
   surviving ship, with a random-unfired fallback if no feasible candidate
   remains.
2. After a hit, it considers unfired orthogonal neighbours.
3. When unresolved hits align, it extends along that axis and can fill an
   unfired interior gap.
4. When a ship sinks, only that ship's hit cells leave unresolved-hit memory;
   hits belonging to another surviving ship remain targetable.

This gives Normal a sharper, more hostile rhythm without granting Poseidon
information the player does not have.

## Design & Narrative

The visual language is a restrained Homeric night voyage: deep Aegean blue,
midnight indigo, muted teal, moonlit silver, and bronze. Fleet names are
ancient vessels—Great War Galley, Heavy Trireme, War Trireme, Scout Galley,
and Raider. Story beats persist outside the reducer's eight-entry battle log,
so the crossing can accumulate narrative moments without changing game rules.

The backdrop is deliberately hand-drawn. Cyclops is a volcanic island with a
faint eye deep in a cave; Sirens are filled silhouettes on a rock; Scylla and
Charybdis remain atmospheric discoveries; Poseidon is implied by storms,
lightning, and water; Ithaca is distant firelight.

## Audio

Combat uses separate pools for splash, hit, explosion, sinking, victory, and
defeat effects, plus an independent queued voice channel with its own toggle.
The final NOSTOS cut replaced the modern military-command voice with processed
TTS in a lower, cavernous Poseidon register and moved the effects toward
wooden hull impacts and ancient-sea textures. This is processed TTS, not a
voice actor.

Audio work was validated on this machine by checking asset responses, measured
levels, and HTML audio element playback progress, including simultaneous SFX
and voice progress. There is no audio device here, so listening was not
claimed; the user confirmed the final audio fixes by ear.

## Accessibility & Responsive Design

Boards and cells retain descriptive ARIA labels, live announcements remain
separate from the visible comms feed, spent cells are disabled, and focus
styles remain visible. Placement supports keyboard rotation with `R`, and
sound and voice can be muted independently.

The layout reflows the command rail and combat order for phone widths, uses
fluid board cells while preserving square 11×11 tracks and A–J/1–10 labels,
and keeps the sunk-galley overlay aligned at desktop and narrow widths.
Typography and spacing use responsive CSS. Backdrop animation, water motion,
and whirlpool motion are covered by the existing reduced-motion guard.

## Running Locally

Use Node 22.12.0:

```bash
source ~/.nvm/nvm.sh
nvm use 22.12.0
npm install
npm run dev
```

The development server runs at `http://localhost:5173`.

| Command | Description |
| --- | --- |
| `npm run dev` | Start the Vite development server |
| `npm run build` | Typecheck and build the production bundle |
| `npm run preview` | Serve the production build locally |
| `npm run typecheck` | Run `tsc -b --noEmit` |
| `npm run lint` | Run oxlint |
| `npm test` | Run the Vitest suite once |
| `npm run test:watch` | Run Vitest in watch mode |

## Testing

The current suite contains **73 Vitest tests** covering board helpers,
placement, rules, reducer transitions, and AI behavior. The standard
verification pass is:

```bash
npm test
npm run typecheck
npm run lint
npm run build
```

The responsive presentation has also been checked at narrow phone widths,
including board fit, descendant overflow, sunk-overlay geometry, reduced
motion, and rendered landmark placement. Audio browser checks measure network
responses, levels, and playback progress rather than claiming unaudible
machine playback.

## Deployment

NOSTOS is a static Vercel site using the Vite preset. `npm run build` emits
`dist/`, Vercel reads the Node version from `engines.node`, pushes to `main`
deploy production, and pull requests receive previews. No environment
variables are required.

## Debugging & Iteration

The resolved issues and the actual sequence of diagnosis, critique, and
validation are recorded in [`DEBUGGING.md`](./DEBUGGING.md). The document
distinguishes functional, UX, visual, audio, and design-iteration work rather
than presenting every subjective refinement as a runtime bug.
