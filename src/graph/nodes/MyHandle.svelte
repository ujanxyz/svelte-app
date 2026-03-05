<script lang="ts">
import { Handle, Position, type HandleProps  } from '@xyflow/svelte';
// Icons.
import EmptyIcon from "phosphor-svelte/lib/EmptyIcon";
import SignInIcon from "phosphor-svelte/lib/SignInIcon";
import SignOutIcon from "phosphor-svelte/lib/SignOutIcon";

const size = 12;

interface Props {
    id?: string;
    kind: "in" | "out" | "in-x" | "out-x";
}

let { id, kind } : Props = $props();
</script>

{#if (kind === "in") }
  <Handle type="target" {id} position={Position.Left} data-enabled={true} style="--handle-size: {size}px;">
    <SignInIcon size={size} />
  </Handle>
{:else if (kind === "in-x") }
  <Handle type="target" position={Position.Left} data-enabled={false}
        isConnectable={false}
        style="--handle-size: {size}px;">
    <EmptyIcon size={size} />
  </Handle>
{:else if (kind === "out") }
  <Handle type="source" {id} position={Position.Right} data-enabled={true} style="--handle-size: {size}px;">
    <SignOutIcon size={size} />
  </Handle>
{:else if (kind === "out-x") }
  <Handle type="source" position={Position.Right} data-enabled={false}
        isConnectable={false}
        style="--handle-size: {size}px;">
    <EmptyIcon size={size} />
  </Handle>
{/if}

<style>
:global(.svelte-flow .svelte-flow__node .svelte-flow__handle) {
  border: 0;
  width: calc(var(--handle-size) + 4px + 2px);
  height: calc(var(--handle-size) + 4px + 2px);
  padding: 2px;
  border: 0;
  border: 1px solid var(--color-bg-3);
}

:global(.svelte-flow .svelte-flow__node .svelte-flow__handle svg) {
  display: block;
}

:global(.svelte-flow .svelte-flow__node .svelte-flow__handle[data-enabled=true]) {
  background-color: #37496a;
  color: var(--color-text-hi-con);
}

:global(.svelte-flow .svelte-flow__node .svelte-flow__handle[data-enabled=false]) {
  background-color: var(--color-bg-2);
  color: var(--color-text-lo-con);
}

</style>