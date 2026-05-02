<script lang="ts">
import { setContext, type Snippet } from "svelte";

import { OVERLAY_INSTANCE_CONTEXT } from "./constants";
import { defaultOverlayOptions } from "./constants";
import type { OverlayInstance } from "./types";

interface Props {
  children: Snippet;
}

const { children }: Props = $props();

const mockInstance: OverlayInstance<any, any> = {
  id: "mock-overlay-id",
  payload: undefined,
  options: { ...defaultOverlayOptions },
  manager: undefined as any,
  settle: () => {},
  abort: () => {},
};

setContext(OVERLAY_INSTANCE_CONTEXT, mockInstance);
</script>

{@render children()}
