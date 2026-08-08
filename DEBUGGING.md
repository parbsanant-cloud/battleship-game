# Debugging Summary

This is a record of resolved project bugs. Each entry separates the observed
bug from its cause, resolution, and validation. The validation method matters:
some defects were covered by tests or static analysis, while others only
appeared in the rendered browser UI or required user confirmation.

## 1. Node version mismatch

- **Bug:** Vite could not start or build in the development environment.
- **Cause:** Vite 8 requires Node `^20.19 || >=22.12`, while the environment
  defaulted to Node 20.18.1.
- **Resolution:** Pinned `.nvmrc` to 22.12.0 and added
  `engines.node: ">=22.12"`, which Vercel also reads.
- **Validation:** `npm run dev` and `npm run build` succeeded on Node 22.12.0;
  the deployed Vercel build matched the local build.

## 2. Invalid CSS colour token

- **Bug:** Text fell back to its inherited colour because the `--text` CSS
  custom property was ignored.
- **Cause:** A stray non-ASCII character made the hex literal invalid:
  `#e8f1ف`.
- **Resolution:** Corrected the value to `#e8f1fa`.
- **Validation:** The computed colour resolved correctly and the theme rendered
  as intended in the browser.

## 3. Vacuously-true fleet destruction

- **Bug:** An empty fleet could be reported as destroyed.
- **Cause:** `Array.every` returns `true` for an empty array. Both fleets are
  empty during placement, so checking at the wrong time could declare an
  instant winner.
- **Resolution:** `isFleetDestroyed` now requires `fleet.length > 0`.
- **Validation:** Unit tests cover `isFleetDestroyed([]) === false` and the
  false-before/true-after-17-hits transition.

## 4. Name shadowing in shot results

- **Bug:** A shot-result field made the `shipCells` name ambiguous in code that
  also used the ship-footprint helper.
- **Cause:** The result field shared its name with the exported `shipCells()`
  helper.
- **Resolution:** Renamed the result field to `sunkCells` and updated its
  consumers and tests.
- **Validation:** Typecheck and the full test suite passed; `ai.ts` now
  consumes `sunkCells` unambiguously.

## 5. Lint warning from a component module export

- **Bug:** Fast Refresh linting warned about `Board.tsx`.
- **Cause:** The `coordLabel` helper was exported from a component module,
  weakening Fast Refresh guarantees.
- **Resolution:** Made `coordLabel` module-private.
- **Validation:** `npm run lint` completed cleanly.

## 6. Unsafe cast in tests

- **Bug:** A test could hide a missing fleet-spec lookup.
- **Cause:** `FLEET.find(...) as ShipSpec` suppressed the real
  `| undefined` type and could turn a lookup failure into a confusing
  downstream error.
- **Resolution:** Added a `specFor(id)` helper that throws a named error when
  a ship is missing.
- **Validation:** Typecheck passed without the cast, and tests now fail
  explicitly if the lookup is invalid.

## 7. Battle fleet panels did not stack on narrow screens

- **Bug:** At approximately 375px, the two fleet-status panels stayed side by
  side and overflowed instead of following the stacked board layout.
- **Cause:** The responsive breakpoint restacked the boards but not the
  fleet-panel grid.
- **Resolution:** The then-current `.battle-screen__fleets` grid was changed
  to one column at the existing 860px breakpoint. The redesign later removed
  that selector; this entry records the historical defect and fix.
- **Validation:** Browser verification at 375px showed no horizontal page
  scroll.

## 8. Revealed enemy ships were nearly invisible

- **Bug:** On defeat, revealed ships looked like slightly lighter water rather
  than ships.
- **Cause:** The initial revealed fill, `#3a5061`, measured only 1.97:1 against
  the water fill, below the 3:1 WCAG non-text minimum.
- **Resolution:** Raised the revealed fill to `#7a8d9c`.
- **Validation:** Rendered pixel sampling measured 4.82:1 against water and
  3.76:1 against miss cells.

## 9. Spent cells stayed interactive

- **Bug:** Cells with resolved shots remained focusable buttons even though
  clicking them could not do anything.
- **Cause:** `Cell` derived `disabled` only from the board-level `interactive`
  prop and ignored the cell's own state; the reducer rejected repeat shots,
  hiding the issue from mouse-only play.
- **Resolution:** `Cell` now disables resolved `hit`, `miss`, `sunk`, and
  `revealed` states while leaving `empty` and `ship` states interactive.
- **Validation:** After a shot, the cell was disabled and skipped by keyboard
  navigation; re-clicking it left the shot count unchanged.

## 10. Normal hunt fired into impossible late-game pockets

- **Bug:** Normal hunt could select an unfired cell where no remaining ship
  could fit, especially when only a three-cell ship remained.
- **Cause:** Hunt mode selected uniformly from every unfired cell without
  checking whether a remaining ship could physically occupy it.
- **Resolution:** AI memory records sunk ship identities. Normal hunt derives
  the smallest remaining ship length and filters candidates by the longest
  contiguous unfired run through each cell in both orientations. It retains a
  random-unfired fallback when filtering produces no candidates; Easy mode and
  target-mode candidates are unchanged.
- **Validation:** The user found this during gameplay; neither the tests nor
  code review had caught it. Live production instrumentation then recorded
  179 hunt shots with zero violations, including 63 shots with a smallest
  surviving ship of at least three cells. New tests cover isolated cells,
  undersized pockets, sunk-ship tracking, fallback, Easy mode, and full-game
  termination.

## 11. Battle log clipped its own history

- **Bug:** The reducer retained eight battle-log entries, but the panel's fixed
  height showed roughly three, leaving most history unreachable.
- **Cause:** `.battle-log__list` used a `10rem` `max-height` with
  `overflow: hidden`.
- **Resolution:** Removed the height clamp and hidden overflow.
- **Validation:** Browser verification showed all eight entries. The user
  confirmed no further change was needed.

## 12. Placement previews lifted per cell on hover

- **Bug:** A multi-cell green or red placement preview rose one cell at a
  time, so it no longer read as a single ship footprint.
- **Cause:** Generic per-cell hover lift also applied to preview cells.
- **Resolution:** Suppressed the hover transform for valid and invalid preview
  states in CSS only; placement logic was unchanged.
- **Validation:** Verified across ship lengths and both horizontal and vertical
  orientations.

## 13. Fleet-status indicators were not mirrored between fleets

- **Bug:** Player and enemy fleet panels presented ship indicators differently,
  making the paired panels hard to compare.
- **Cause:** The indicator treatment was conditional on which fleet panel was
  being rendered.
- **Resolution:** Made the fleet-status indicator treatment symmetric between
  both panels.
- **Validation:** Browser review confirmed comparable player and enemy
  rosters while preserving the existing information boundary.

## 14. Vertical sunk silhouettes sat off their footprint

- **Bug:** Vertical sunk-ship overlays were displaced from the cells they
  represented.
- **Cause:** The SVG is rotated 90 degrees for vertical ships, and rotating
  around the centre of a non-square box displaced the overlay.
- **Resolution:** Derived overlay geometry from the existing `--cell`, `--gap`,
  and board-padding contract instead of relying on the rotated box's position.
- **Validation:** Rendered measurements showed 0px start and end deltas against
  both horizontal and vertical ship footprints.

## 15. Sunk silhouettes looked like bright blocky shapes

- **Bug:** Sunk silhouettes were too bright, and their steel detail appeared
  above rather than within the hull.
- **Cause:** The original red treatment used high-lightness fills and
  uncontained internal shapes.
- **Resolution:** Moved the hull to dark charcoal/steel, reduced red to a
  perimeter glow, and clipped internal structures inside the hull.
- **Validation:** The user judged the revised silhouettes visually in the
  browser.

## 16. Sound effects went silent after voice callouts landed

- **Bug:** Splash, hit, and explosion effects stopped decoding after the voice
  feature landed. This was our own regression and should have been caught in
  review.
- **Cause:** The voice work rewrote the six effect URLs to `.mp3`, but those
  assets were still `.wav`. Dev and preview served the missing `.mp3` paths
  through the HTML fallback, so the audio elements received no decodable
  effect. This was not a mixing or shared-element problem: SFX and voice
  already used separate elements.
- **Resolution:** Restored the `.wav` effect URLs and rebalanced the mix
  without changing the audio architecture.
- **Validation:** Confirmed valid audio responses and simultaneous progress on
  the SFX and voice elements. The build machine had no audio device, so
  levels and playback progress were measured rather than heard; the user
  confirmed the result by ear.

## 17. The miss splash cue was inaudible

- **Bug:** The miss splash played but was inaudible compared with hit and
  explosion cues.
- **Cause:** End-to-end tracing exonerated the event path, routing, muting, and
  volume. The synthesised `miss.wav` was approximately 4dB quieter than the
  hit cues and too thin in the low-mid band.
- **Resolution:** Regenerated only `miss.wav` with a fuller water body and
  raised the SFX volume to match the other effects.
- **Validation:** Measured the regenerated cue's RMS against the hit cues and
  confirmed browser element progress for both player and AI misses. The build
  machine had no audio output; the user confirmed audibility by ear.

## 18. The end-of-game summary required scrolling

- **Bug:** The game-over result and Play Again control sat at the bottom of the
  page, below the fold when the game ended.
- **Cause:** The existing summary rendered inline instead of as a viewport-level
  dialog.
- **Resolution:** Wrapped the existing `GameOver` card in a fixed, centred
  dialog with a dark backdrop and internal scrolling for short viewports.
- **Validation:** The report was visible without page scrolling, the board
  remained visible behind it, and focus landed on Play Again.

## 19. The mission report blocked inspection of the final board

- **Bug:** The centred report covered the enemy fleet deliberately revealed on
  defeat, making the reveal difficult to study.
- **Cause:** The modal was always present for the completed game and had no
  dismissal path.
- **Resolution:** Added close and Escape dismissal using local UI state in
  `App`, without changing game state. The command rail now carries persistent
  Play Again and Mission report controls; Play Again still dispatches the
  existing `NEW_GAME` action.
- **Validation:** Deterministic defeat showed that after dismissal the revealed
  fleet and final board remained inspectable, while board cells stayed
  non-interactive. Reopening restored the report and its focus behavior.

## 20. The redesign review found several rendered-UI defects

- **Bug:** Rendered review exposed multiple presentation defects: the command
  rail Status readout truncated to `YOUR ACT…`; difficulty displayed the raw
  lowercase union value; the roster count had broken spacing and showed
  placed-of-total (always `5 / 5`) in combat; friendly ship cells were
  near-white and dominated the hierarchy; and the classification strip
  collapsed to an approximately 20px empty box.
- **Cause:** The rail allocated too little width for its longest values, the
  raw difficulty value was used directly, the roster count used array length,
  the ship fill did not fit the palette hierarchy, and the decorative strip
  had no meaningful minimum width.
- **Resolution:** Sized the rail for full readouts, uppercased difficulty for
  presentation, counted afloat vessels in combat, applied a darker steel
  hull treatment, and gave the strip a deliberate width (hiding it at narrow
  breakpoints rather than letting it collapse).
- **Validation:** Browser inspection at desktop and 375px checked rendered
  text dimensions, computed cell colours, rail geometry, and horizontal
  overflow. These defects were caught by inspecting the UI rather than by
  tests.

## 21. The comms feed could hide its newest message

- **Bug:** Immediately after a shot, the newest transmission could disappear
  from the visible feed.
- **Cause:** The live region is intentionally clipped for screen readers, while
  the feed also suppressed its first entry whenever its text matched
  `state.message`. Two individually reasonable decisions combined to hide the
  message from sight.
- **Resolution:** Render every battle-log entry and keep the clipped live
  region solely as the announcement channel.
- **Validation:** Browser checks after both a hit and a miss showed the newest
  transmission in the visible list.

## 22. Enemy roster names were unnecessarily hidden

- **Bug:** The redesign showed `Unknown contact N` and `UNASSESSED` for enemy
  ships even though the player already had the relevant ship identities.
- **Cause:** The redesign treated names as hidden information despite the
  integrity pips already disclosing each ship's length. This removed useful
  information and broke the intended symmetry between the paired rosters.
- **Resolution:** Restored real ship names and one shared status vocabulary:
  `OPERATIONAL`, `DAMAGED`, `CRITICAL`, and `DESTROYED`, with `READY` reserved
  for deployment. Enemy positions remain masked.
- **Validation:** Browser review confirmed mirrored rosters without revealing
  enemy positions or changing the fairness boundary.

## Closing note

These entries cover resolved issues found during implementation, review, and
user verification. The project was validated with the relevant combination of
unit tests, typechecking, linting, browser checks, rendered-UI inspection, and
production-build verification; no entry should be read as a claim that every
historical defect was detectable by automated tests alone.
