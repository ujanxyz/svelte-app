# Cubic Bezier Editor Spec (Part 11)

## Scope

This document defines a practical editable cubic Bezier system for the design editor:

- Editable open/closed paths
- Anchor/control point editing with node-type constraints
- Node insertion/deletion
- Export of pure geometry and node-type code string
- Overlay editor synchronized to view size and zoom

## Data Model

```ts
import type { base } from "@/types/base";

type BezierNodeType = "cusp" | "smooth" | "sym" | "auto";

type BezierSegment = {
  p: base.XYPosition; // anchor
  c0: base.XYPosition; // incoming control handle
  c1: base.XYPosition; // outgoing control handle
};

type EditableBezierSegment = BezierSegment & {
  type: BezierNodeType;
};

type CubicBezierPath = {
  segments: BezierSegment[];
  closed: boolean;
};

type EditableCubicBezierPath = {
  segments: EditableBezierSegment[];
  closed: boolean;
};
```

Coordinate contract:

- Segment points are stored in normalized local shape coordinates in [-100, 100]
- Shape transform x/y is center of shape bounds
- Render mapping to local pixels:

$$
X_{local} = \frac{x_{norm}}{100}\cdot\frac{W}{2},\quad
Y_{local} = \frac{y_{norm}}{100}\cdot\frac{H}{2}
$$

Node-type export string:

- cusp => C
- smooth => S
- sym => Z
- auto => A

Example: CCSSZAASS

## Path Geometry

For segment i to i+1:

$$
B_i(t)=(1-t)^3P_i + 3(1-t)^2tC^1_i + 3(1-t)t^2C^0_{i+1} + t^3P_{i+1},\quad t\in[0,1]
$$

For closed paths, the last segment connects n-1 to 0.

## Interaction Rules

### Anchor Drag

When anchor i moves by delta \(\Delta\):

$$
P_i' = P_i + \Delta,
\quad C^0_i{}' = C^0_i + \Delta,
\quad C^1_i{}' = C^1_i + \Delta
$$

For auto nodes, handles are recomputed after move.

### Control Drag and Continuity

Let moved handle vector be \(v = H - P\).

- cusp: opposite handle unchanged
- smooth: opposite handle must be colinear and opposite direction, keep previous opposite length \(L\)

$$
H_{opp}' = P - \hat{v}\,L
$$

- sym: opposite handle mirrors moved handle

$$
H_{opp}' = P - v
$$

- auto: same immediate drag behavior as sym; subsequent anchor edits re-run auto solve

### Auto Handle Solve

Given previous/next anchors around anchor \(P_i\), tangent:

$$
T = \mathrm{normalize}(P_{i+1}-P_{i-1})
$$

Open-end fallback:

- first node: \(T=\mathrm{normalize}(P_1-P_0)\)
- last node: \(T=\mathrm{normalize}(P*n-P*{n-1})\)

Handle lengths:

$$
\ell_{in}=k\|P_i-P_{i-1}\|,\quad
\ell_{out}=k\|P_{i+1}-P_i\|,
\quad k\approx 0.28
$$

Auto handles:

$$
C^0_i = P_i - T\ell_{in},\quad C^1_i = P_i + T\ell_{out}
$$

## Node Add/Delete

### Add Node (clicked selected anchor)

Insert a new node after selected index i:

- new type defaults to last selected node-type button
- default anchor position is midpoint to next anchor (or tangent extension at open tail)
- for cusp->cusp insertion, generate near-straight controls by splitting with 1/3 and 2/3 lerp

### Delete Node

Remove selected node if minimum cardinality remains:

- open path minimum: 2 nodes
- closed path minimum: 3 nodes

After delete, recompute auto neighbors.

## UI Behavior

Top action bar includes:

- Node type buttons (single-select): Cusp, Smooth, Sym, Auto
- Open/Closed toggle
- Add Next button
- Delete selected node button

Selection behavior:

- selecting a node auto-selects matching type button
- clicking an already-selected node inserts a new node after it

## Rendering and View Sync

- Editor overlay dimensions must match viewDimension
- Grid must use existing AdaptiveGrid with current zoomLevel
- World-to-screen:

$$
x_s = (x_w-z_x)\cdot z + \frac{W_v}{2},
\quad
y_s = (y_w-z_y)\cdot z + \frac{H_v}{2}
$$

- Inverse mapping for pointer editing:

$$
x_w = \frac{x_s-\frac{W_v}{2}}{z} + z_x,
\quad
y_w = \frac{y_s-\frac{H_v}{2}}{z} + z_y
$$

## Integration Points

- Graphic type: cubic-bezier
- Shape class: CubicBezierShape (extends ShapeGraphicBase)
- Deep edit overlay component: CubicBezierEditor.svelte
- Transform layer opens the bezier editor on double-click for cubic-bezier selection
- EditorPage forwards path updates to selected CubicBezierShape and refreshes engine + hit-canvas
