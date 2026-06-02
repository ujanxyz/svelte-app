# Design Editor Feature Addition - Part 11

I would like to build a cubic Bezier curve (both open and closed) editor in Svelte-5 Typescript (uses runes), similar to Inkscape and Adobe Illustrator. This would be a complex component to have full feature parity with Inkscape / Illustrator. Help me fles out the feature specs in details.

Basic features:

In a Bezier curve editor, there are 3 types of nodes:

- Cusp / Corner Nodes (Diamond shaped icon). C^0 continuity, i.e. not continuous. Sharp change in direction. The handles (control points) are independent of each other.
- Smooth Nodes (Circled shaped symbol): C^1 continuity, with the handles are colinear with the anchor. moving one handle automatically adjusts the direction of the opposite handle to remain so that both remain at 180-degrees from each other, but the opposide length does not change.
- Symmetrical Nodes (Square shaped symbol): These are specialized version of smooth nodes where the handles lie at exactly same length from the anchor. Moving one handle also changes the length of the opposite handle along with its direction.
- Auto-smooth nodes (Circled shaped symbol)
  Used for drawing nice curves, without worrying about handles or segment shapes. The handles sit on a straight line, and their distance from the node adapts automatically when you move the node, so a smooth curve is drawn. A smooth node has a circular shape.

The node types need to be stored in the data type to provide the right kind of edit support, though they are not part of the mathematical definition of bezier curve. So the editor supports exporting the pure path separately, and the type array as a string like "CCSSZAASS" (C=cusp, S=smooth, Z=symmetric, A=auto-smooth)

- Drag around the anchor points, for each segment the start and control points are relative to the anchor point in that segment, and also move along with the anchor point.
- Drag around the control points.

Use the following type to represent Bezier curve.

```ts
type BezierSegment = {
  p: base.Point; // anchor point
  c0: base.Point; // start control point
  c1: base.Point; // end control point
};

type EditableBezierSegment = BezierSegment & {
  type: "cusp" | "smooth" | "sym" | "auto";
};

type CubicBezierPath = {
  segments: CubicBezierSegment[];
  closed: boolean;
};

type EditableCubicBezierPath = {
  segments: EditableBezierSegment[];
  closed: boolean;
};
```

At the top there is an action bar, which has a section for node types: 4 icons for 4 types (only obne can be selected), when a node is selected the right button becomes auto selected. Using the buttons user can change the type of the node. When a new node is added it's type is the last selected one.

Support add a new node by clicking on a node. It's not trivial to support node insertion at any arbitrary point on the curve that requires complex math. For now just support adding a new node N' (of same type) next to the clicked one N. N' gets the outgoing handle from N, and insert a new segment from N to N' depending on the types of N and N'. E.g. for cusp node join by a straight line segment.

Support delete a node by selecting the node, and click the delete button at the action bar.

Flesh out the specs in an .md file in this dir, formalize the necessary math formulas.

---

First create a new shape class `CubicBezierShape.svelte` to represent a closed bezier curve. Use the above type `EditableCubicBezierPath` for it's underlying data. Like `PolygonGraphic` type, its coordinates are relative to center within [-100, 100]. Implement drawing functions for this. In `GraphicFactories.ts` the demo create methods create 3 bezier curves as well, one open 2 closed.

Then implement the same as a Svelte-5 component, name `CubicBezierEditor.svelte`
The editor supports drawing grid and zoom, using the existing grid drawing lib (`AdaptiveGrid.ts`) and zoomLevel from the store, and the editor has the same dimension as the view canvas. So it is expected to be in sync with the main editor.
Wire this in like `DeepEdit.svelte`
