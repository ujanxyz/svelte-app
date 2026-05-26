# Design Editor View Demo - Implementation Spec (Pre-Code)

## 1) Requirement Summary

Build a Canva-like design editor skeleton with:

- A fixed-size viewport container (Svelte component): 60rem x 40rem.
- A virtual ViewCanvas that is 4x the page size in each dimension.
- A centered PageCanvas rectangle (logical page) inside the view canvas.
- Pan + zoom interactions with clamped ranges.
- A shape list (circles + rectangles) rendered from TS classes.
- Out-of-page content shown in grayscale, in-page content shown in real color.
- A grid renderer that adapts to pan/zoom; X=0 and Y=0 lines thicker.
- Implementation as a pure TS editor library used by Svelte 5 component `DesignEditorViewDemo` (no props).

Output requested now: implementation analysis and detailed plan before writing code.

## 2) Feasibility Analysis

This is fully feasible in browser Canvas 2D with strong control over:

- Pan/zoom transform matrices.
- Layered draw passes (grid, grayscale world, color page overlay).
- Clip regions for page-only color redraw.
- Interaction constraints for bounded panning and zoom levels.

No external rendering engine is required.

### Potentially Tricky but Manageable

- Pan clamping when zoom changes (must recompute bounds per zoom).
- Grid spacing that remains readable across zoom levels.
- Efficient redraw strategy on pointer move/wheel events.

## 3) Clarifications / Assumptions

Assumptions to keep implementation concrete:

- Coordinate space uses separate page origin and view origin; view canvas origin is the same as page origin.
- Page size defaults to 600 x 400.
- View canvas size defaults to 2400 x 1600.
- Shapes are provided in world coordinates.
- Zoom is continuous, with a default range: [0.25, 4.0].
- Pan is in world units and clamped so viewport never reveals outside the view canvas extent.
- Canvas is HiDPI-aware using devicePixelRatio scaling.

## 4) Proposed Architecture

## 4.1 Core Modules (Pure TS)

1. `DesignEditorEngine`

- Owns state: viewport size, page rect, view rect, pan, zoom, shapes.
- Owns rendering pipeline orchestration.
- Owns interaction handlers (pointer, wheel, resize).
- Public API:
  - `mount(container: HTMLDivElement): void`
  - `destroy(): void`
  - `setShapes(shapes: Shape[]): void`
  - `setPageSize(width: number, height: number): void`

2. `Camera2D`

- Responsible for world <-> screen transforms.
- Stores `zoom`, `panX`, `panY`.
- Exposes methods:
  - `worldToScreen(p: Point): Point`
  - `screenToWorld(p: Point): Point`
  - `applyToContext(ctx): void`
  - `clampPan(viewBounds, viewportSize): void`

3. `Shape` model

- Base abstract class:
  - `id`, `fill`, `zIndex`, optional `stroke`.
  - `draw(ctx): void`
  - `getBounds(): Rect`
- Concrete classes:
  - `CircleShape`
  - `RectShape`

4. `GridRenderer`

- Draws adaptive major/minor grid.
- Highlights X=0 and Y=0 axes with stronger stroke.
- Takes camera transform + visible world rect.

5. `RenderPipeline`

- Executes deterministic draw passes (see section 6).

## 4.2 Svelte Integration Layer

Component: `DesignEditorViewDemo.svelte`

- Renders host div with required size.
- On mount, creates engine and mounts into container.
- Creates demo shapes (5 circles, 6 rectangles).
- Passes shape list via engine API.
- On destroy, disposes listeners/resources.

No props in this demo component.

## 5) Data Model

## 5.1 Geometry

- `Point { x, y }`
- `Rect { x, y, width, height }` where x/y is top-left in world coordinates.

## 5.2 Page / View Geometry

For page W x H:

- Page rect centered at origin:
  - `x = -W/2`, `y = -H/2`, `width = W`, `height = H`
- View rect centered at origin:
  - `x = -2W`, `y = -2H`, `width = 4W`, `height = 4H`

This preserves the requirement that page center and view center are identical.

## 6) Rendering Plan (Important)

Each frame:

1. Clear full viewport canvas.
2. Save context and apply camera transform.
3. Draw grid across visible world range.
4. Draw all shapes in grayscale context (whole view area behavior).
5. Restore/Save and apply page clipping rect.
6. Draw all shapes again in full color, clipped to page rect only.
7. Draw page border on top.
8. Optionally draw view bounds border/debug overlay.

Why this works:

- Pass 4 guarantees everything is visible as gray.
- Pass 6 redraws only the page region in color, overriding grayscale there.

Alternative considered:

- Draw shape-by-shape and split path intersections by page region.
- Rejected for complexity in skeleton phase.

## 7) Pan / Zoom and Constraints

## 7.1 Zoom behavior

- Wheel zoom centered on cursor (preferred UX):
  - Convert cursor screen point to world before zoom.
  - Apply zoom delta.
  - Convert cursor screen point to world after zoom.
  - Adjust pan so cursor-anchored world point remains stable.

## 7.2 Pan behavior

- Pointer drag with middle-button or space+drag (or left drag in demo mode).
- Pan stored in world units.

## 7.3 Clamping

Goal: viewport must stay within view canvas bounds.

At current zoom, visible half extents in world units:

- `halfWorldW = viewportPxW / (2 * zoom)`
- `halfWorldH = viewportPxH / (2 * zoom)`

Given view rect center at origin and extents `viewHalfW`, `viewHalfH`, clamp camera center:

- `centerX in [-viewHalfW + halfWorldW, viewHalfW - halfWorldW]`
- `centerY in [-viewHalfH + halfWorldH, viewHalfH - halfWorldH]`

If viewport becomes larger than view at low zoom:

- lock center to 0 on that axis.

## 8) Grid Adaptation Strategy

Use step quantization by zoom to keep line density useful:

- Compute target pixel spacing range (e.g., 24-48 px).
- Convert to world spacing candidate: `targetWorld = targetPx / zoom`.
- Snap to sequence: 1, 2, 5, 10, 20, 50, ...
- Minor lines at step, major lines every 5th step.
- Axes x=0 and y=0 thicker + stronger color.

## 9) Improvements Beyond Baseline

These are practical enhancements that can be added with low/medium effort:

Low effort

- HiDPI crisp rendering and resize observer.
- `requestAnimationFrame` invalidation queue (avoid redundant redraws).
- Debug overlay (zoom level, pan, visible world rect).

Medium effort

- Z-index sorting for shape draw order.
- Offscreen static grid cache for performance.
- Keyboard nudging for pan/zoom and reset view.

Future (not in v0)

- Selection, resize handles, transform gizmos.
- Multi-page support.
- Layer panel and locking.

## 10) Phased Implementation Plan (Before Coding)

Phase 1 - Skeleton and state

- Create engine shell, camera, and basic canvas mount lifecycle.
- Render page rect + view bounds only.
- Add deterministic redraw loop with invalidate method.

Phase 2 - Shapes and dual-pass rendering

- Implement base shape classes and sample dataset.
- Add grayscale full-scene pass + color clipped page pass.
- Verify out-of-page behavior visually.

Phase 3 - Pan/zoom + constraints

- Add pointer drag and wheel zoom.
- Implement zoom-anchor math.
- Add clamp logic and test extreme zoom/pan.

Phase 4 - Adaptive grid

- Add grid utility with major/minor lines and axis emphasis.
- Validate readability at min and max zoom.

Phase 5 - Svelte demo wrapper

- Implement `DesignEditorViewDemo.svelte` with 60rem x 40rem host div.
- Instantiate engine and inject demo shapes (5 circles, 6 rectangles).
- Ensure cleanup on unmount.

Phase 6 - Hardening

- ResizeObserver + DPR scaling.
- Lightweight smoke tests (render does not throw, constraints hold).

## 11) Risk Log + Mitigations

1. Pan clamp jitter near bounds

- Mitigation: clamp in world-space after each interaction and after resize.

2. Blurry rendering on retina

- Mitigation: separate CSS size and canvas backing store size via DPR.

3. Performance drops while dragging

- Mitigation: rAF batching + avoid full recomputation unless state changed.

4. Inconsistent coordinate conversions

- Mitigation: all conversions centralized in `Camera2D`.

## 12) Acceptance Criteria

- View canvas is 4x page size and centered with page.
- Pan/zoom works with constraints; cannot expose outside view area.
- Grid adapts to zoom; axes are emphasized.
- Shapes render gray globally and full color only within page area.
- Svelte demo component mounts engine into 60rem x 40rem div with no props.
- Demo includes at least 5 circles and 6 rectangles.

## 13) What is feasible now vs needs later work

Feasible now (v0)

- Complete visual skeleton, pan/zoom, constraints, grid, and dual-pass page coloring.

Needs later integration or richer APIs

- Any authoritative encoding/ID logic from WASM (if required in future editor actions).
- Complex editor behaviors (selection, alignment guides, snapping, text editing).

---

This document is the implementation-first plan and should be used as the execution reference before code changes.
