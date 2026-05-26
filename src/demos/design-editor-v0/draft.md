# Design Editor Feature Addition - Part 3

Flex out a plan about how to combine the design editor view, the element store, the hit canvas, and transform handle.

Define a component `SelectLayer.svelte` which is simply an overlay div that shows the transform handles, bounding boxes, and snap guide lines.
It exposes a handle to show / hode transforms, show bounding box(es) of selected item(s).

- The page (which is big 4x the viewport) is coupled with an instance of `HitCanvas` of same size. Their sizes are always kept in sync (Use offscreen veriant of the hit-canvas)
- Each element has a bounding box, which is calculated during creation, and when the element is stretched, distorted. Rotation does not mutate the bounding box and the bounding box is not axis parallel abd can be rotated.
- When user hovers on an element (checked by hit canvas), it's bounding box if highlighted with a thin purple rectangle. This is implemented with a SVG rect (possibly rotated) at the select layer. Implement this as a new component `ShapeHighlighter.svelte` (with stories), for now it just renders a thin rect with dash lines, keep provision for (with a TODO) multiple rects corresponding to multiple selections.

- When the user does mouse down on an element, it's transform handle becomes visible and active on the select layer. For lines, it's the `TransformLineHandle`, for others it's simply the bounding box. This is rendered as a line or rect, possibly rotated if the element had a rotation.
- When the user drags or transforms the element, the store is not immediately updated, simply keep changing the transform handle, when the transform handle is released, then only the store is updated and a full redraw is done.

- Incorporate all these functionalities in a master component: `DesignEditor.svelte`. Then the design editor demo widget contains this editor main, and controls to test its behavior. It has an array of buttons to insert various types of elements with random config.

---

Implement a component `TransformLayer.svelte` which is a full screen div, absolute positioned, i.e. shown as an overlay spanning the entire parent, and displaying transform handles.

```ts
export type TransformMode = "hover" | "tx" | "line" | "none";

/**
 * Resets the transform on state change.
 * The transform contains
 */
export function reset(mode: TransformMode, tx: TransformDelta);
```
