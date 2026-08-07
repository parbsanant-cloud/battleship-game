---
name: testing-battleship-ui
description: How to run and UI-test the Battleship React/Vite app locally or as a production bundle (dev server, board cell coordinate mapping, preview/placement selectors, state oracle, AI-behaviour proofs, accessibility, reduced-motion and responsive checks).
---

# Testing the Battleship app (React + Vite)

## Running it

- The box may default to Node 20, which Vite 8 rejects. Use Node 22.12.0 first:
  `source ~/.nvm/nvm.sh && nvm use 22.12.0` (or prepend `$HOME/.nvm/versions/node/v22.12.0/bin` to PATH).
- `npm run dev` serves on http://localhost:5173. Deps are usually already installed by the
  blueprint's `npm install` maintenance step; `npm install` again if `node_modules` is missing.
- To test the **production** bundle instead: `npm run build && npm run preview` → http://localhost:4173.
  Start `preview` in a **persistent** shell session; a backgrounded server started in a one-shot shell
  dies with that shell. Confirm with `curl -sI http://localhost:4173` before driving the browser.
- Kill any leftover dev server on :5173 before testing a production build, so you cannot accidentally
  test unminified code and report it as the production bundle.
- Static gates: `npx vitest run` (69 tests as of PR #10), `npm run typecheck` (`tsc -b --noEmit`),
  `npm run lint` (`oxlint`), `npm run build`. All are fast (<5s each) and shell-only — don't record them.
- No login, no secrets, no backend — everything is client-side React state (`useReducer` in
  `src/App.tsx`), so any screen can be reached purely by clicking.

## Devin Secrets Needed

None.

## Where the logic lives (useful for grounding assertions)

- `src/App.tsx` — owns the reducer, hover state, the derived hover preview, and the `R` keyboard
  shortcut (a `window` keydown listener that bails on ctrl/meta/alt and on `INPUT`/`TEXTAREA`/`SELECT`
  targets — so `R` intentionally does nothing while a radio/text input is focused).
- `src/game/reducer.ts` — `PLACE_SHIP` silently ignores invalid origins and auto-advances the
  selection to the first unplaced ship; `START` only fires when all 5 ships are placed.
- `src/game/placement.ts` — `canPlace` = every footprint cell in bounds AND unoccupied. Ships MAY
  touch; only overlap is illegal. Don't assert an "adjacency" rule, it doesn't exist.
- `src/styles.css` — `--valid: #3ddc84` (green preview), `--invalid: #ff5c5c` (red preview),
  `--cell: 30px` desktop / `26px` under `@media (max-width: 420px)`.

## Driving the board reliably

Board cells are `<button>`s with `aria-label` like `"B2, water"` / `"B2, your ship"`, so the stripped
DOM returned with each screenshot is an exact, cheap oracle for board state — count
`your ship` labels to verify placement (a full random fleet must be exactly 17 cells: 5+4+3+3+2, which
also proves no overlap).

For clicking, map the grid once and reuse: the grid is 11 columns wide (row/column labels occupy the
first row and column). On a maximized 1600px-wide display captured at 1024px, cell centers landed at
`x = 228 + 21.1 * colIndex`, `y = 206 + 21.05 * rowIndex` (A=0, row 1=0). Recompute from one
screenshot if the window size changes: cell pitch is `--cell + gap` CSS px times the screenshot scale.

Handy tricks:
- To focus a board cell without placing a ship, click a cell whose footprint is invalid (overlap) —
  the click is a no-op but the button still takes focus. Then keyboard shortcuts can be tested "with
  a cell focused".
- `onFocus`/`onBlur` also drive the hover preview, so Tab-ing across the board is a valid way to
  demonstrate previews without the mouse.
- Move the mouse off the board before taking "final state" screenshots, otherwise a hover preview
  overlays the board and muddies the evidence.

### Two coordinate spaces — do not mix them

Click coordinates are in the tool's scaled space (e.g. 1024 wide) but **screenshots are saved to disk
at the display's native resolution** (e.g. 1600×1200). Sampling saved-screenshot pixels with
click-space coordinates silently returns gridlines/neighbouring cells and looks like a styling bug.
Check the file's real size first (`PIL.Image.open(path).size`), then map CSS px → image px:
`imgX = cssX * dpr`, `imgY = (cssY + chromeHeight) * dpr` where
`chromeHeight = window.outerHeight - window.innerHeight`. Derive rects from
`getBoundingClientRect()` rather than hand-computed pitch. Conversely, to click a cell the oracle
picked, scale the other way: `[(r.x + r.width/2) * scale, (r.y + r.height/2) * scale + chromeOffset]`.

### Proving a CSS state actually renders

Cell classes come from `` `cell--${state}` `` and aria-labels from a `STATE_DESCRIPTION` map, so a
missing or overridden CSS rule still produces a perfectly correct class and label. **DOM assertions
alone cannot prove the user saw anything** — always pair them with `getComputedStyle(el).backgroundColor`
and/or a sampled screenshot pixel. Current fills: water `rgb(11,32,51)`, miss `rgb(23,52,74)` + light
centre dot `rgb(143,176,198)`, hit `rgb(184,91,45)`, sunk `rgb(143,48,61)`, player ship
(`--ship`) `rgb(108,139,163)`, revealed-on-defeat `rgb(122,141,156)` (was `rgb(58,80,97)` before the
contrast fix — if you sample the old value, you are looking at stale CSS, so hard-reload with
`Ctrl+Shift+R` and re-check before reporting a bug).

### Verifying a colour/contrast change (CSS-only diffs)

Check the diff really is CSS-only first (`git show <sha> --stat`); that is what justifies skipping the
behavioural matrix. Then make the test falsifiable by naming the **old** pixel value up front — a pass
must require the new RGB and a stale bundle must produce the old one.

Cells layer `border` (1px, outermost) → `box-shadow: inset Npx` ring → `background`. Sampling a single
centre pixel cannot tell you whether the border/ring changed too, and sampling near an edge silently
grabs the wrong layer. Instead **walk a vertical strip** across the cell (`dy = 0,1,2,3,…,29`) and read
each layer off the transitions — this verifies border, ring and fill in one shot and self-documents
which band is which. Watch out for decorations that occupy the centre: the miss dot sits dead-centre,
so sample a miss *fill* at roughly centre-x + 9px.

Compute WCAG ratios from the **sampled pixels**, never from the source hex or from someone's stated
arithmetic; report the measured number even when it agrees. `3:1` is the non-text minimum worth
checking against. Also compute the pairs nobody asked about (e.g. revealed↔hit/sunk) so you can answer
the opposite question — whether a colour *overshoots* and starts competing with alert states. Useful
framing: lightness separates the muted states from each other, while hue/saturation is what keeps
achromatic informational states from competing with chromatic urgent ones.

Build swatch strips by **cropping real cells out of the native screenshot** and upscaling with
`Image.NEAREST`, rather than drawing flat rectangles from hex codes — a hand-drawn strip cannot expose
a styling bug, and nearest-neighbour keeps the sampled colours honest.

### At an AI defeat, no player ship cells survive

An AI win requires the player's whole fleet destroyed, so on a defeat screen `.cell--ship` /
`", your ship"` count is **0** — the player-ship fill and any defeat-only reveal styling can never be
on screen at the same time. Verify this (`document.querySelectorAll('.cell--ship').length`) before
reporting that two colours are confusable with each other; the concern may be structurally moot. The
flip side: it also means you **cannot** pixel-sample `--ship` on a defeat screen. Render a placement
board (Randomize) to sample it, and say plainly in the report that leaving the defeat screen was a
sampling necessity rather than a fresh test of whatever screen you navigated through.

## Battle screen and AI behaviour

- Cell `aria-label` is only `"<coord>, <state>"`; the board name (`Your fleet` / `Enemy waters` /
  `Your waters`) lives on the parent `role="group"`, so distinguish boards by group, not cell label.
  States: `water`, `your ship`, `hit`, `miss`, `sunk`.
- Enemy ship cells are masked in the DOM as `water` before game over. **Do not use the DOM to pick
  "safe" cells to fire at** — use the state oracle below, or you will accidentally sink the enemy
  fleet and win before the scenario you wanted (e.g. an AI win) is reached. Re-derive the safe list
  after every batch of clicks; a stale list is the easiest way to ruin a long run.
- Difficulty is only applied by the reducer during the `placement` phase, so select Easy/Normal
  **before** clicking Start Game.
- Flat index = `row * 10 + col` (A1 = 0, J10 = 99). Neighbours are 4-orthogonal only.

### Read-only state oracle

Walk the React fiber tree from the root container to find the reducer state and expose it as
`window.__gs()`. **Start the walk at `root[__reactContainer…].stateNode.current`, not at
`root[__reactContainer…]` itself** — the container key holds a HostRoot fiber whose `.child` is null,
so traversing it directly finds nothing and the oracle silently returns `phase: null`. If your oracle
reports no state on a page that clearly has state, this traversal is the first thing to check.

It returns the live `GameState` with keys:
`phase, difficulty, playerBoard, aiBoard, playerFleet, aiFleet, ai, selectedShipId, orientation,
message, stats, animating, winner`. Fleet entries use `id` (not `shipId`), `cells: [{r,c}]`, `hits`;
AI memory is `ai.fired` (a `Set` of indices) and `ai.hits` (pending wounded coords). This is enough to
assert masking, shot uniqueness (`stats.aiShots === ai.fired.size`), and reset completeness without
touching committed source.

### Proving hunt/target AI (vs. random) defensibly

A random AI sometimes hits a neighbour by luck, so visual adjacency is NOT proof. Replay every AI
shot through a classifier written **independently in the console** — recompute the neighbour and line
candidate sets from the raw pending-hit coords rather than calling the app's own `ai.ts`, otherwise
the test just rubber-stamps the implementation. Classify each shot as `HUNT` (no wounded ship at the
time), `TARGETED` (in the correct candidate set), or `STRAY` (wounded ship existed but shot was
unrelated). Remember to drop a ship's cells from the pending set when it sinks, mirroring
`updateAIMemory`.

Require **opposite, falsifiable outcomes** for the two modes: hunt/target passes only if
`STRAY == 0`; random passes only if `STRAY > 0`. This catches both a no-op targeting implementation
and an "easy" mode wrongly wired to the targeting code.

### Proving a "feasible cells only" hunt filter (and avoiding a vacuous pass)

Normal's hunt phase keeps only cells whose longest contiguous **unfired** run (horizontal or vertical)
is ≥ the smallest surviving ship's length; Easy and target-mode are deliberately unfiltered. To prove
this rather than assert it:

- Snapshot on a timer and diff `ai.fired` to recover each shot coordinate; the *previous* snapshot is
  the pre-shot board (feasibility must be evaluated pre-shot, or the shot itself pollutes the run).
- Classify `HUNT` iff pre-shot `ai.hits.length === 0`. **Only assert feasibility for HUNT** — target
  shots are legitimately infeasible and asserting them produces false failures.
- Compute `smallestRemaining` yourself from `playerFleet` (`hits < length`), **not** from `ai.sunk`.
  The commit added `ai.sunk`, so deriving from it would mask a mis-recorded-sunk bug.
- Compute the runs with your own loop; never call the app's `hasFeasibleRun`, or you rubber-stamp it.
- **The critical step: prove non-vacuity.** Zero violations means nothing if no infeasible cell was
  ever available to pick. Per shot also record `poolTotal` and `poolInfeasible` (unfired cells, and how
  many were infeasible at that moment). Sum them, and report the naive-picker probability
  `Π (1 − poolInfeasible/poolTotal)` — the chance an unfiltered random AI would have dodged them all.
  A healthy late-game run gives something like 44 hunt shots / 0 violations / 187 infeasible candidates
  available / p ≈ 0.7%. If the sum is ~0, say the result is vacuous instead of claiming a pass.
- The user-facing scenario is "only the 3-cell Cruiser left", but the filter is equally exercised the
  moment the 2-cell **Destroyer** sinks and `smallestRemaining >= 3`. Reporting that subset is far more
  reachable than waiting for exactly-one-ship-afloat. Note the subset can end up **empty** if the
  Destroyer survives late — then that game adds no ≥3 evidence and you need another game for it.
- Easy is the contrast case: an infeasible Easy **HUNT** shot proves your classifier can return `false`.
  Easy infeasible shots that turn out to be TARGET-mode do **not** establish the contrast — report it
  inconclusive rather than overclaiming.

### Constructing a mixed board state on purpose

A defeat reached by firing only water leaves the player with zero enemy hits, so revealed cells are the
only enemy state on screen and "hit/sunk keep their styling" goes untested. To get all states at once,
before stalling: use the oracle to group enemy `'ship'` indices into contiguous runs, fully sink one
**isolated** run (a lone 2-cell ship is ideal) to create `sunk` cells, and fire exactly one cell of
another ship to leave a `hit`. Then fire only water and let the AI grind to victory. Adjacent ships make
run-grouping ambiguous — you don't need ship identity, just an isolated run. At the defeat screen assert
`revealed + hit + sunk === 17` alongside exact set equality, which is what makes the accounting airtight.

### Reaching a decisive outcome efficiently

- To force an **AI win**, keep firing verified-water cells so the AI has many turns while the enemy
  fleet survives. Expect 50+ AI shots; batch ~8 clicks with ~2s waits between them (a player shot
  pulses ~450ms, then the AI fires ~700ms later).
- To force a **player win**, read `aiFleet` from the oracle and click its 17 cells directly.
- Patching `Math.random` is usually unnecessary and risky: `NEW_GAME` → `randomFleet()` will spin
  forever on a constant value. If you do patch it, restore the saved native reference **before**
  clicking Play Again, and verify with `(''+Math.random).includes('native code')`.
- A player win must not grant the AI another turn — check `aiShots` is one less than `playerShots`
  (or unchanged across the winning shot).

### Beware vacuous negative tests at game over

Both win conditions are `isFleetDestroyed(fleet)`, so at a **player** game over every enemy `'ship'`
cell has necessarily already become `hit`/`sunk` and `aiBoard.cells` holds zero `'ship'` entries.
Any assertion of the form "on a player win, remaining unhit enemy ships must not be \<rendered
somehow\>" is therefore **structurally vacuous** — it passes whether or not the guarding
`winner === 'ai'` condition exists, because there is nothing left to render. "Game over + player won +
unhit enemy ships remain" is an unreachable state via the UI. Report such checks as weak passes and
say plainly which half of the condition is actually falsifiable (usually only `phase === 'gameOver'`,
provable by checking mid-play). This pattern will recur for any future "reveal/annotate something only
when X wins" feature.

### Testing a Vercel deployment — expect deployment protection

Preview deployments for this project sit behind Vercel SSO: requesting one returns
`HTTP/2 302 → https://vercel.com/sso-api?url=…&nonce=…` and lands on `https://vercel.com/login`.
There is no way through without credentials or a protection-bypass token, and `list_secrets` has
none. **Don't burn time on the SSO wall.** The faithful fallback is to build the *same commit*
locally and serve it with `npm run preview` — same source, same minified output.

If you take that fallback, keep the evidence boundary explicit in the report:

| Assertions | Environment |
|---|---|
| functional / AI / a11y / responsive / visual | local serve of the production bundle at the commit under test |
| "deployed hosting works" smoke only | the public production URL |

Public production may be one or more PRs behind, so it must **not** be cited as evidence for the
changes under test. Corroborate the version gap cheaply by comparing bundle hashes
(`grep -o 'assets/index-[A-Za-z0-9]*\.js' dist/index.html` vs the `<script src>` on the live site) —
differing hashes prove the deployed build predates your commit. Never write "tested on Vercel" when
only the smoke check ran there.

### Injected console helpers die on navigation

Everything you attach to `window` (`__gs`, pollers, drive helpers) is wiped by any page load —
including navigating away to the production URL and back, and any hard reload. Symptom: `1+1`
evaluates fine but `window.__gs().foo` fails with "CDP evaluation failed" (it's a TypeError on
`undefined`, not a transport problem). Re-inject after every navigation, or fall back to DOM
aria-labels, which survive everything. Also `clearInterval` any poller you started before a long
grind, or you'll leak timers across games.

## Accessibility specifics

### Spent cells are `disabled`; prove tab-skipping by tabbing

`Cell` disables `hit`/`miss`/`sunk`/`revealed` states, while `empty` and `ship` stay **enabled** —
placement needs that so hovering your own placed ship still shows the red invalid preview. So a
regression here shows up as "hovering a placed ship does nothing", which is worth checking explicitly.

Reading the `disabled` attribute does **not** prove the cell is skipped by keyboard navigation. Focus
the cell immediately *before* a spent one, send a real `Tab` key press, then read
`document.activeElement.getAttribute('aria-label')` and assert it is the cell *after* the spent one.
Make it non-trivial by arranging **two** spent cells (e.g. A1 and C1) so a single Tab must jump a gap
mid-row (A1 spent → lands B1; then C1 spent → lands D1).

### FleetStatus pips

The damage-pips wrapper is `role="img"` with `aria-label` `"{n} of {len} cells hit"`, and the `<li>`
no longer carries a redundant `aria-label`. Capture a **partial** value (e.g. `"3 of 4 cells hit"`),
not just 0-of-N and N-of-N — only a partial value proves `n` is actually wired to live damage.
Assert the absence too: `[...lis].every(l => !l.hasAttribute('aria-label'))`.

### Reduced motion — measure the dwell, don't eyeball it

Enable DevTools → Rendering → *Emulate CSS prefers-reduced-motion*, confirm
`matchMedia('(prefers-reduced-motion: reduce)').matches === true`, and confirm the Styles pane shows
the `@media (prefers-reduced-motion: reduce)` block applying `transition-duration: 0s` and
`animation: none`. The Rendering drawer is long — scroll it to find the dropdown.

"Still works" is weak. The mechanism is the animation timeout collapsing to 0, so **measure it**: poll
`__gs().animating` on a short interval and record how long it stays non-null. Baseline at normal motion
is ~450–460ms per turn; under reduced motion a 10ms poller catches zero samples. Report that honestly
as an **upper bound (<10ms)**, not a measured zero, and pair it with a lockup check (log the `phase`
sequence and assert `aiTurn → playerTurn` keeps alternating for several full cycles).

## Responsive checks

Chrome enforces a ~500px minimum OS window width, so `wmctrl -e 0,0,0,375,1100` will NOT give a 375px
viewport (you get ~500). Use Chrome's responsive viewport (F12 then Ctrl+Shift+M, type the width into
the Dimensions field) for sub-500px widths, and verify numerically with
`document.documentElement.scrollWidth === clientWidth` for "no horizontal scrolling". Close the device
toolbar and devtools afterwards so the recording ends on the real app.
