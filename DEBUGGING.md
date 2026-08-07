# Debugging Summary

These are bugs encountered during development. The contrast between
unit-test coverage, browser verification, and code review is intentional:
some failures were observable only in the running UI, while others were best
caught by tests or static review.

## 1. Node version mismatch

- **Bug:** The development environment used a Node version that Vite 8 did not
  support.
- **Symptom:** Vite refused to start or build on the development machine.
- **Root Cause:** Vite 8 requires Node `^20.19 || >=22.12`, while the
  environment defaulted to Node 20.18.1.
- **Resolution:** Pinned `.nvmrc` to 22.12.0 and added
  `engines.node: ">=22.12"`, which Vercel also reads.
- **Validation:** `npm run dev` and `npm run build` succeed on Node 22.12.0,
  and the deployed Vercel build matches locally. Browser/build verification.

## 2. Invalid CSS colour token

- **Bug:** The `--text` CSS custom property contained an invalid hex literal.
- **Symptom:** The `--text` custom property was ignored and text fell back to
  the inherited colour.
- **Root Cause:** A stray non-ASCII character had been typed into the hex
  literal (`#e8f1ف`), making the declaration invalid.
- **Resolution:** Corrected the value to `#e8f1fa`.
- **Validation:** The computed colour resolves and the theme renders as
  intended. Browser verification.

## 3. Vacuously-true fleet destruction

- **Bug:** Empty fleets could be reported as destroyed.
- **Symptom:** A bare `fleet.every(ship => ship.hits === ship.length)` reported
  an empty fleet as destroyed. Both fleets are empty during placement, so a
  check at the wrong moment could declare an instant winner.
- **Root Cause:** `Array.every` is vacuously true on an empty array.
- **Resolution:** `isFleetDestroyed` now requires `fleet.length > 0`.
- **Validation:** Unit tests assert `isFleetDestroyed([]) === false` and cover
  the false-before/true-after-17-hits transition. Unit-test coverage.

## 4. Name shadowing in the shot result

- **Bug:** A shot-result field shared a name with the ship-footprint helper.
- **Symptom:** The `sunk` result's `shipCells` field shadowed the exported
  `shipCells()` footprint helper, making a file using both names ambiguous.
- **Root Cause:** The result field was named after an existing helper.
- **Resolution:** Renamed the field to `sunkCells` and updated usages and tests.
- **Validation:** Typecheck and the full suite pass; `ai.ts` consumes
  `sunkCells` unambiguously. Typecheck and unit-test coverage.

## 5. Lint: component file exporting a non-component

- **Bug:** A helper export from a component module triggered a Fast Refresh
  lint warning.
- **Symptom:** oxlint reported a `react/only-export-components` warning on
  `Board.tsx`.
- **Root Cause:** The `coordLabel` helper was exported from a component module,
  which breaks Fast Refresh guarantees.
- **Resolution:** Made `coordLabel` module-private.
- **Validation:** `npm run lint` is clean. Static analysis.

## 6. Unsafe cast in tests

- **Bug:** A test cast hid a possible missing fleet-spec lookup.
- **Symptom:** `FLEET.find(...) as ShipSpec` silently produced `undefined`
  typed as `ShipSpec` if a lookup failed, leading to a confusing downstream
  error instead of a clear failure.
- **Root Cause:** The cast suppressed the real `| undefined` type.
- **Resolution:** Added a `specFor(id)` helper that throws a named error when a
  ship is missing.
- **Validation:** Typecheck passes with no casts; tests fail loudly rather than
  obscurely. Typecheck and unit-test coverage.

## 7. Battle fleet panels did not stack on narrow screens

- **Bug:** The responsive fleet layout did not collapse with the boards.
- **Symptom:** At approximately 375px, the two fleet-status panels stayed side
  by side and overflowed.
- **Root Cause:** The responsive breakpoint restacked the boards but not the
  fleet grid.
- **Resolution:** `.battle-screen__fleets` collapses to one column at the
  existing 860px breakpoint.
- **Validation:** Verified at 375px with no horizontal page scroll
  (`scrollWidth === clientWidth`). Browser verification.

## 8. Revealed enemy ships were nearly invisible

- **Bug:** The initial revealed-ship colour did not distinguish ships clearly
  enough from water.
- **Symptom:** On defeat, revealed ships looked like slightly lighter water
  rather than ships.
- **Root Cause:** The first revealed fill, `#3a5061`, measured only 1.97:1
  against the water fill, below the 3:1 WCAG non-text minimum.
- **Resolution:** Raised the revealed fill to `#7a8d9c`.
- **Validation:** Pixel-sampled from the rendered board at 4.82:1 versus water
  and 3.76:1 versus miss. Browser verification.

## 9. Spent cells stayed interactive

- **Bug:** Cells with resolved shots remained enabled buttons.
- **Symptom:** Cells already fired upon remained enabled buttons: focusable
  dead tab stops that did nothing when clicked.
- **Root Cause:** `Cell` derived `disabled` only from the board-level
  `interactive` prop and ignored the cell's own state. The reducer rejected
  repeat shots, so the defect was invisible with a mouse.
- **Resolution:** `Cell` now disables resolved shot states (`hit`, `miss`,
  `sunk`, `revealed`) while leaving `empty` and `ship` interactive.
- **Validation:** After a shot, the cell is disabled, skipped by keyboard
  navigation, and a re-click leaves the shot count unchanged. Browser
  verification and code review.

## 10. Normal hunt fired into impossible late-game pockets

- **Bug:** Normal hunt could select an unfired cell that no remaining ship
  could occupy.
- **Symptom:** Late in a game, with only a three-cell ship left, the AI fired
  at cells with fewer than three connected open squares: impossible locations.
- **Root Cause:** Normal hunt selected uniformly from every unfired cell
  without checking whether any remaining ship could physically fit through it.
- **Resolution:** AI memory now records sunk ship identities from its own shot
  results. Normal hunt derives the smallest remaining ship length and filters
  candidates by the maximum contiguous unfired run through each cell in either
  orientation. It retains a random-unfired fallback if filtering produces no
  candidates; Easy mode and target-mode candidates are unchanged.
- **Validation:** User gameplay observation found the defect, rather than unit
  tests or code review. The fix was subsequently re-verified on live
  production: instrumented Normal games recorded 179 hunt shots with zero
  violations, including 63 shots where the smallest surviving ship was at
  least three cells long; 1,362 impossible cells were available and never
  chosen. New unit tests also cover isolated cells, undersized pockets,
  sunk-ship length tracking, fallback behavior, Easy-mode behavior, and
  full-game termination.

## Closing note

Every bug listed above was identified during implementation and resolved before
the final submission. The completed project passed automated tests, browser
verification, and production validation before release.
