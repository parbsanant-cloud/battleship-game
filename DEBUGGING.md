# Debugging notes

These are bugs actually encountered during development. The contrast between
unit-test coverage, browser verification, and code review is intentional:
some failures were observable only in the running UI, while others were best
caught by tests or static review.

## 1. Node version mismatch

- **Symptom:** Vite refused to start or build on the development machine.
- **Root cause:** Vite 8 requires Node `^20.19 || >=22.12`, while the
  environment defaulted to Node 20.18.1.
- **Fix:** Pinned `.nvmrc` to 22.12.0 and added `engines.node: ">=22.12"`,
  which Vercel also reads.
- **Validation:** `npm run dev` and `npm run build` succeed on Node 22.12.0,
  and the deployed Vercel build matches locally. Browser/build verification.

## 2. Invalid CSS colour token

- **Symptom:** The `--text` custom property was ignored and text fell back to
  the inherited colour.
- **Root cause:** A stray non-ASCII character had been typed into the hex
  literal (`#e8f1ف`), making the declaration invalid.
- **Fix:** Corrected the value to `#e8f1fa`.
- **Validation:** The computed colour resolves and the theme renders as
  intended. Browser verification.

## 3. Vacuously-true fleet destruction

- **Symptom:** A bare `fleet.every(ship => ship.hits === ship.length)` reported
  an empty fleet as destroyed. Both fleets are empty during placement, so a
  check at the wrong moment could declare an instant winner.
- **Root cause:** `Array.every` is vacuously true on an empty array.
- **Fix:** `isFleetDestroyed` now requires `fleet.length > 0`.
- **Validation:** Unit tests assert `isFleetDestroyed([]) === false` and cover
  the false-before/true-after-17-hits transition. Unit-test coverage.

## 4. Name shadowing in the shot result

- **Symptom:** The `sunk` result's `shipCells` field shadowed the exported
  `shipCells()` footprint helper, making a file using both names ambiguous.
- **Root cause:** The result field was named after an existing helper.
- **Fix:** Renamed the field to `sunkCells` and updated usages and tests.
- **Validation:** Typecheck and the full suite pass; `ai.ts` consumes
  `sunkCells` unambiguously. Typecheck and unit-test coverage.

## 5. Lint: component file exporting a non-component

- **Symptom:** oxlint reported a `react/only-export-components` warning on
  `Board.tsx`.
- **Root cause:** The `coordLabel` helper was exported from a component module,
  which breaks Fast Refresh guarantees.
- **Fix:** Made `coordLabel` module-private.
- **Validation:** `npm run lint` is clean. Static analysis.

## 6. Unsafe cast in tests

- **Symptom:** `FLEET.find(...) as ShipSpec` silently produced `undefined`
  typed as `ShipSpec` if a lookup failed, leading to a confusing downstream
  error instead of a clear failure.
- **Root cause:** The cast suppressed the real `| undefined` type.
- **Fix:** Added a `specFor(id)` helper that throws a named error when a ship is
  missing.
- **Validation:** Typecheck passes with no casts; tests fail loudly rather than
  obscurely. Typecheck and unit-test coverage.

## 7. Battle fleet panels did not stack on narrow screens

- **Symptom:** At approximately 375px, the two fleet-status panels stayed side
  by side and overflowed.
- **Root cause:** The responsive breakpoint restacked the boards but not the
  fleet grid.
- **Fix:** `.battle-screen__fleets` collapses to one column at the existing
  860px breakpoint.
- **Validation:** Verified at 375px with no horizontal page scroll
  (`scrollWidth === clientWidth`). Browser verification.

## 8. Revealed enemy ships were nearly invisible

- **Symptom:** On defeat, revealed ships looked like slightly lighter water
  rather than ships.
- **Root cause:** The first revealed fill, `#3a5061`, measured only 1.97:1
  against the water fill, below the 3:1 WCAG non-text minimum.
- **Fix:** Raised the revealed fill to `#7a8d9c`.
- **Validation:** Pixel-sampled from the rendered board at 4.82:1 versus water
  and 3.76:1 versus miss. Browser verification.

## 9. Spent cells stayed interactive

- **Symptom:** Cells already fired upon remained enabled buttons: focusable
  dead tab stops that did nothing when clicked.
- **Root cause:** `Cell` derived `disabled` only from the board-level
  `interactive` prop and ignored the cell's own state. The reducer rejected
  repeat shots, so the defect was invisible with a mouse.
- **Fix:** `Cell` now disables resolved shot states (`hit`, `miss`, `sunk`,
  `revealed`) while leaving `empty` and `ship` interactive.
- **Validation:** After a shot, the cell is disabled, skipped by keyboard
  navigation, and a re-click leaves the shot count unchanged. Browser
  verification and code review.

## 10. Normal hunt fired into impossible late-game pockets

- **Symptom:** Late in a game, with only a three-cell ship left, the AI fired
  at cells with fewer than three connected open squares: impossible locations.
- **Root cause:** Normal hunt selected uniformly from every unfired cell
  without checking whether any remaining ship could physically fit through it.
- **Fix:** AI memory now records sunk ship identities from its own shot results.
  Normal hunt derives the smallest remaining ship length and filters candidates
  by the maximum contiguous unfired run through each cell in either
  orientation. It retains a random-unfired fallback if filtering produces no
  candidates; Easy mode and target-mode candidates are unchanged.
- **Validation:** User gameplay observation found the defect, rather than unit
  tests or code review. New unit tests cover isolated cells, undersized
  pockets, sunk-ship length tracking, fallback behavior, Easy-mode behavior,
  and full-game termination.
