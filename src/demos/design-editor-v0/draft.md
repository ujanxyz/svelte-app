# Design Editor Feature Addition - Part 4

Update `CanvasElement` to remove `x2` and `y2` used in line type. The 2 end points are captured by start point and rotation. For a line it always has height 0 and width same as the line length. If it is parallel to X-axis and start point is to right, rotation would be 180 degrees.

From `applyLineTransformToElement`
move that trigonometric / math logic to caller in `TransformLineV2`, and then in `EditorPage`, `applyLineTransformToElement` can probably be replaced by `applyFrameTransformToElement`.
