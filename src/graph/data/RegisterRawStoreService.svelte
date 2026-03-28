<script lang="ts">
import {
  type Edge,
  type Node,
  type Viewport,
  type XYPosition,
} from "@xyflow/svelte";

import { registerGraphService } from "../graph-services";

let _nodes = $state.raw<Node[]>([]);
let _edges = $state.raw<Edge[]>([]);
let _viewport = $state.raw<Viewport>({ zoom: 1, x: 0, y: 0 });

let _pivot = $state.raw<XYPosition>({ x: 0, y: 0 });

registerGraphService("rawStoreService", {
  get nodes(): Node[] {
    return _nodes;
  },

  set nodes(value: Node[]) {
    _nodes = value;
  },

  get edges(): Edge[] {
    return _edges;
  },

  set edges(value: Edge[]) {
    _edges = value;
  },

  get viewport(): Viewport {
    return _viewport;
  },

  set viewport(value: Viewport) {
    _viewport = value;
  },

  get pivot(): XYPosition {
    return _pivot;
  },

  set pivot(value: XYPosition) {
    _pivot = value;
  },

  currentViewport(): Viewport {
    return $state.snapshot(_viewport);
  },
});
</script>
