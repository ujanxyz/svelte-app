# Design Editor Feature Addition - Part 5

Migrate the use of canvas elements `BaseElement` and `CanvasElement` to use the encapsulated classes derived from `Graphicbase`. And retire the old typescript types.

Now `DesignEditorEngine.ts` also has support for the new graphic types along with the legacy ones. Use those.
