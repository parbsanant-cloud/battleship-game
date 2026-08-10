# Debugging Summary

This is a record of resolved project bugs. Each entry separates the observed
bug from its cause, resolution, and validation. The validation method matters:
some defects were covered by tests or static analysis, while others only
appeared in the rendered browser UI or required user confirmation.

## 1. Node version mismatch

- **Classification:** Functional bug
- **Bug:** Vite could not start or build in the development environment.
- **Cause:** Vite 8 requires Node `^20.19 || >=22.12`, while the environment
  defaulted to Node 20.18.1.
- **Resolution:** Pinned `.nvmrc` to 22.12.0 and added
  `engines.node: ">=22.12"`, which Vercel also reads.
- **Validation:** `npm run dev` and `npm run build` succeeded on Node 22.12.0;
  the deployed Vercel build matched the local build.

## 2. Invalid CSS colour token

- **Classification:** Visual defect
- **Bug:** Text fell back to its inherited colour because the `--text` CSS
  custom property was ignored.
- **Cause:** A stray non-ASCII character made the hex literal invalid:
  `#e8f1ف`.
- **Resolution:** Corrected the value to `#e8f1fa`.
- **Validation:** The computed colour resolved correctly and the theme rendered
  as intended in the browser.

## 3. Vacuously-true fleet destruction

- **Classification:** Functional bug
- **Bug:** An empty fleet could be reported as destroyed.
- **Cause:** `Array.every` returns `true` for an empty array. Both fleets are
  empty during placement, so checking at the wrong time could declare an
  instant winner.
- **Resolution:** `isFleetDestroyed` now requires `fleet.length > 0`.
- **Validation:** Unit tests cover `isFleetDestroyed([]) === false` and the
  false-before/true-after-17-hits transition.

## 4. Name shadowing in shot results

- **Classification:** Functional bug
- **Bug:** A shot-result field made the `shipCells` name ambiguous in code that
  also used the ship-footprint helper.
- **Cause:** The result field shared its name with the exported `shipCells()`
  helper.
- **Resolution:** Renamed the result field to `sunkCells` and updated its
  consumers and tests.
- **Validation:** Typecheck and the full test suite passed; `ai.ts` now
  consumes `sunkCells` unambiguously.

## 5. Lint warning from a component module export

- **Classification:** Functional bug
- **Bug:** Fast Refresh linting warned about `Board.tsx`.
- **Cause:** The `coordLabel` helper was exported from a component module,
  weakening Fast Refresh guarantees.
- **Resolution:** Made `coordLabel` module-private.
- **Validation:** `npm run lint` completed cleanly.

## 6. Unsafe cast in tests

- **Classification:** Functional bug
- **Bug:** A test could hide a missing fleet-spec lookup.
- **Cause:** `FLEET.find(...) as ShipSpec` suppressed the real
  `| undefined` type and could turn a lookup failure into a confusing
  downstream error.
- **Resolution:** Added a `specFor(id)` helper that throws a named error when
  a ship is missing.
- **Validation:** Typecheck passed without the cast, and tests now fail
  explicitly if the lookup is invalid.

## 7. Battle fleet panels did not stack on narrow screens

- **Classification:** UX bug
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

- **Classification:** Visual defect
- **Bug:** On defeat, revealed ships looked like slightly lighter water rather
  than ships.
- **Cause:** The initial revealed fill, `#3a5061`, measured only 1.97:1 against
  the water fill, below the 3:1 WCAG non-text minimum.
- **Resolution:** Raised the revealed fill to `#7a8d9c`.
- **Validation:** Rendered pixel sampling measured 4.82:1 against water and
  3.76:1 against miss cells.

## 9. Spent cells stayed interactive

- **Classification:** UX bug
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

- **Classification:** Functional bug
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

- **Classification:** UX bug
- **Bug:** The reducer retained eight battle-log entries, but the panel's fixed
  height showed roughly three, leaving most history unreachable.
- **Cause:** `.battle-log__list` used a `10rem` `max-height` with
  `overflow: hidden`.
- **Resolution:** Removed the height clamp and hidden overflow.
- **Validation:** Browser verification showed all eight entries. The user
  confirmed no further change was needed.

## 12. Placement previews lifted per cell on hover

- **Classification:** Visual defect
- **Bug:** A multi-cell green or red placement preview rose one cell at a
  time, so it no longer read as a single ship footprint.
- **Cause:** Generic per-cell hover lift also applied to preview cells.
- **Resolution:** Suppressed the hover transform for valid and invalid preview
  states in CSS only; placement logic was unchanged.
- **Validation:** Verified across ship lengths and both horizontal and vertical
  orientations.

## 13. Fleet-status indicators were not mirrored between fleets

- **Classification:** UX bug
- **Bug:** Player and enemy fleet panels presented ship indicators differently,
  making the paired panels hard to compare.
- **Cause:** The indicator treatment was conditional on which fleet panel was
  being rendered.
- **Resolution:** Made the fleet-status indicator treatment symmetric between
  both panels.
- **Validation:** Browser review confirmed comparable player and enemy
  rosters while preserving the existing information boundary.

## 14. Vertical sunk silhouettes sat off their footprint

- **Classification:** Visual defect
- **Bug:** Vertical sunk-ship overlays were displaced from the cells they
  represented.
- **Cause:** The SVG is rotated 90 degrees for vertical ships, and rotating
  around the centre of a non-square box displaced the overlay.
- **Resolution:** Derived overlay geometry from the existing `--cell`, `--gap`,
  and board-padding contract instead of relying on the rotated box's position.
- **Validation:** Rendered measurements showed 0px start and end deltas against
  both horizontal and vertical ship footprints.

## 15. Sunk silhouettes looked like bright blocky shapes

- **Classification:** Design iteration
- **Bug:** Sunk silhouettes were too bright, and their steel detail appeared
  above rather than within the hull.
- **Cause:** The original red treatment used high-lightness fills and
  uncontained internal shapes.
- **Resolution:** Moved the hull to dark charcoal/steel, reduced red to a
  perimeter glow, and clipped internal structures inside the hull.
- **Validation:** The user judged the revised silhouettes visually in the
  browser.

## 16. Sound effects went silent after voice callouts landed

- **Classification:** Audio defect
- **Bug:** Splash, hit, and explosion effects stopped decoding after the voice
  feature landed. This was our own regression and should have been caught in
  review.
- **Cause:** The voice work rewrote the six effect URLs to `.mp3`, but those
  assets were still `.wav`. Dev and preview served the missing `.mp3` paths
  through the HTML fallback, so the audio elements received no decodable
  effect. This was not a mixing or shared-element problem: SFX and voice
  already used separate elements.
- **Resolution:** Restored the `.wav` effect URLs and rebalanced the mix
  without changing the audio architecture. The later NOSTOS re-cut replaced
  the modern military-command voice with processed TTS in a lower register
  with cavernous resonance and moved the effects toward wooden hull impacts.
- **Validation:** Confirmed valid audio responses and simultaneous progress on
  the SFX and voice elements. The build machine had no audio device, so
  levels and playback progress were measured rather than heard; the user
  confirmed both the earlier fix and the NOSTOS re-cut by ear. The voice is
  processed TTS, not a voice actor.

## 17. The miss splash cue was inaudible

- **Classification:** Audio defect
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

- **Classification:** UX bug
- **Bug:** The game-over result and Play Again control sat at the bottom of the
  page, below the fold when the game ended.
- **Cause:** The existing summary rendered inline instead of as a viewport-level
  dialog.
- **Resolution:** Wrapped the existing `GameOver` card in a fixed, centred
  dialog with a dark backdrop and internal scrolling for short viewports.
- **Validation:** The report was visible without page scrolling, the board
  remained visible behind it, and focus landed on Play Again.

## 19. The mission report blocked inspection of the final board

- **Classification:** UX bug
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

- **Classification:** Design iteration
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

- **Classification:** UX bug
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

- **Classification:** UX bug
- **Bug:** The redesign showed `Unknown contact N` and `UNASSESSED` for enemy
  ships even though the player already had the relevant ship identities.
- **Cause:** The redesign treated names as hidden information despite the
  integrity pips already disclosing each ship's length. This removed useful
  information and broke the intended symmetry between the paired rosters.
- **Resolution:** Restored real ship names and one shared status vocabulary:
  `OPERATIONAL`, `DAMAGED`, `CRITICAL`, and `DESTROYED`, with `READY` reserved
  for deployment. Enemy positions remain masked. The later NOSTOS reskin
  replaced those historical naval labels with the current mythic vocabulary:
  `WHOLE`, `WOUNDED`, `FALTERING`, `SUNK`, and deployment-only `READY`.
- **Validation:** Browser review confirmed mirrored rosters without revealing
  enemy positions or changing the fairness boundary.

## 23. Sunk galley overlays drifted above their footprints

- **Classification:** Visual defect
- **Bug:** During the NOSTOS end-to-end test, sunk galley overlays sat as much
  as 15px above the cells they represented at desktop widths. They aligned at
  375px, so the earlier narrow-screen check did not expose the defect.
- **Cause:** `.board` pinned its columns but left rows auto-sized. Surplus
  height stretched the real row pitch to roughly 39.5px, while the overlay
  `calc()` assumed the 38px pitch from `var(--cell) + var(--gap)`, accumulating
  about 1.5px of drift per row.
- **Resolution:** Pinned the rows with
  `grid-template-rows: repeat(11, var(--cell))` in commit `0e11af9`.
- **Validation:** Measured every sunk silhouette against the union rectangle of
  its footprint cells for all five fleet lengths in both orientations at
  desktop and 375px. Every edge delta was `0.00px`.

## 24. Sunk galley oars were clipped

- **Classification:** Visual defect
- **Bug:** The oars on the top-down sunk galley artwork disappeared at the
  hull boundary.
- **Cause:** Oars extended beyond the hull but were drawn inside the hull's
  clip group.
- **Resolution:** Moved the oars outside the clipped hull group.
- **Validation:** Browser inspection of the rendered sunk silhouettes showed the
  full oars beyond the hull.

## 25. Story beats disappeared from the OMENS & VOICES feed mid-game

- **Classification:** Functional bug
- **Bug:** Narrative beats derived from the battle log disappeared or changed
  order in the `OMENS & VOICES` feed during longer matches.
- **Cause:** The reducer intentionally caps the battle log at eight entries, so
  presentation beats derived from that log were evicted with older messages.
- **Resolution:** Added persistent `storyBeats` presentation state and a
  `storyBeatRef` in `App`, while leaving the reducer and game log contract
  unchanged.
- **Validation:** Browser playthroughs showed the `OMENS & VOICES` feed
  retaining its triggered beats after the underlying battle log rolled
  forward.

## 26. The first Poseidon offering beat used the wrong event

- **Classification:** Functional bug
- **Bug:** “Poseidon has taken his first offering” appeared when the player sank
  an enemy vessel.
- **Cause:** The trigger was keyed to the wrong side of the battle rather than
  to the message emitted when the player's own ship was lost.
- **Resolution:** Re-keyed the beat to messages containing `The sea has claimed`.
- **Validation:** The presentation trigger now follows the AI sinking a player
  vessel; sinking an enemy vessel does not fire it.

## 27. The NOSTOS reskin still looked like a modern naval board

- **Classification:** Design iteration
- **Bug:** This was not a runtime failure: the copy, fleet names, narrative,
  and sunk artwork had changed, but the grid still read as a modern blue
  tactical interface—teal water, raised rounded tiles, a red sunk bounding
  box, and a monospace coordinate ruler.
- **Cause:** The board surface and cell states had not yet adopted the same
  Homeric visual language as the rest of the presentation.
- **Resolution:** PR #29 reskinned the boards and states. It took three
  passes: the first made ships nearly invisible and hits outline-only; the
  second made ships bright caramel and too close in hue to hits; the third
  settled on cool dark timber for intact and revealed ships, charred ember
  for hits, ivory foam rings for misses, and disturbed dark water for sunk
  footprints, with the galley carrying the sunk meaning.
- **Validation:** Each pass was reviewed in rendered placement and combat
  screenshots, including a state with intact ships, hits, misses, and sunk
  silhouettes visible together. Gameplay geometry and alignment remained
  unchanged.

## 28. Mobile clipping was hidden by a page-level false negative

- **Classification:** UX bug
- **Bug:** A real iPhone-sized review showed clipped command-rail content and
  horizontal layout pressure even though the earlier check reported
  `document.scrollWidth === clientWidth`.
- **Cause:** Page-level scroll width is blind to descendants clipped inside
  their own boxes. At 375px, readouts measured `328 / 310`, difficulty
  `86 / 61`, accuracy `79 / 61`, and the header `340 / 334` for
  `scrollWidth / clientWidth`. At 320px, `body { min-width: 320px }` also
  caused genuine document overflow.
- **Resolution:** Reflowed the command rail into mobile readout rows, made
  `--cell` fluid through 320px, removed the body minimum width, tightened
  mobile spacing, and added responsive `clamp()` typography.
- **Validation:** Rechecked `document`, `body`, and `client` widths at 320,
  375, and 390px; walked descendants for clipped or offscreen content; and
  re-measured sunk overlays under fluid cells. The worst overlay deviation was
  `0.06px` at 320/375px and `0.11px` at 390px.

## 29. The first Odyssey backdrop did not render as a world

- **Classification:** Design iteration
- **Bug:** The first backdrop technically rendered but did not achieve the
  intended ancient illustrated sea. Landmarks were distorted or invisible,
  the sea read as near-black, and some landmarks showed through translucent
  panels.
- **Cause:** A single 1600×2400 SVG with `preserveAspectRatio="none"` smeared
  landmarks across viewport aspect ratios. The old fixed, negative-z-index
  `body::before` and `body::after` layers composited over the new backdrop;
  the centre vignette crushed the page margins. The sea gradient was too dark,
  and placement was not checked against the actual rendered UI column.
- **Resolution:** Split landmarks into individually sized, preserved-aspect
  inline SVGs; removed the competing body layers; lifted the Aegean palette;
  and positioned landmarks in actual margins and below-fold gaps. Two seam
  defects in that fix were then resolved: the vertical seam at the content
  column and the horizontal seam where the viewport-height body painting area
  ended. The sea moved to `:root` with `background-attachment: fixed`.
- **Validation:** Desktop and mobile rendered geometry checks confirmed
  landmarks outside gameplay panels, while bottom-of-page screenshots checked
  sea continuity. An intermediate pass appended about 1.5 screens of empty
  mobile water to host all five landmarks; that contradicted the request to
  reduce scrolling, so it was reverted to two mobile landmarks in real
  negative space and the document returned from `3520px` to `1891px`.

## 30. Cyclops and Sirens read as cartoons

- **Classification:** Design iteration
- **Bug:** Screenshot review showed the Cyclops as a flat blob with a large
  high-contrast eyeball, closer to a whale or a hat than a distant mythic
  island. The Sirens were thin outlined arcs with dots that read as arches.
- **Cause:** The first silhouettes used overly literal, high-contrast shapes
  instead of atmospheric forms.
- **Resolution:** Redrew Cyclops as a jagged volcanic island with a cave mouth
  and a small faint eye-glow deep inside. Redrew Sirens as filled, draped
  silhouettes on a jagged rock, removing bright outlines and head dots.
- **Validation:** Screenshot review confirmed both landmarks read as
  low-contrast discoveries rather than foreground characters.

## Closing note

These 30 entries cover resolved issues found during implementation, review, and
user verification. Classifications distinguish behaviour failures from
usability problems, rendering defects, audio failures, and design iterations.
The validation method is stated per entry; no entry should be read as a claim
that every historical defect was detectable by automated tests alone.
