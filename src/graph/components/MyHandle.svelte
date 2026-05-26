<script lang="ts">
import { Handle, type HandleProps, Position } from "@xyflow/svelte";
// Icons.
import EmptyIcon from "phosphor-svelte/lib/EmptyIcon";
import SignInIcon from "phosphor-svelte/lib/SignInIcon";
import SignOutIcon from "phosphor-svelte/lib/SignOutIcon";

const size = 6;

interface Props {
  id?: string;
  kind: "in" | "out" | "in-x" | "out-x";
}

let { id, kind }: Props = $props();
</script>

{#if kind === "in"}
  <Handle
    type="target"
    {id}
    position={Position.Left}
    data-enabled={true}
    title={id}
    style="--handle-size: {size}px;"
  >
    <SignInIcon {size} />
  </Handle>
{:else if kind === "in-x"}
  <Handle
    type="target"
    position={Position.Left}
    data-enabled={false}
    isConnectable={false}
    title={id}
    style="--handle-size: {size}px;"
  >
    <EmptyIcon {size} />
  </Handle>
{:else if kind === "out"}
  <Handle
    type="source"
    {id}
    position={Position.Right}
    data-enabled={true}
    title={id}
    style="--handle-size: {size}px;"
  >
    <SignOutIcon {size} />
  </Handle>
{:else if kind === "out-x"}
  <Handle
    type="source"
    position={Position.Right}
    data-enabled={false}
    isConnectable={false}
    title={id}
    style="--handle-size: {size}px;"
  >
    <EmptyIcon {size} />
  </Handle>
{/if}

<style>
:global(.svelte-flow .svelte-flow__node .svelte-flow__handle) {
  border: 0;
  width: calc(var(--handle-size) + 4px + 2px);
  height: calc(var(--handle-size) + 4px + 2px);
  padding: 2px;
  border: 0;
  border: 0.5px solid var(--color-border-subtle);
}

:global(.svelte-flow .svelte-flow__node .svelte-flow__handle svg) {
  display: block;
}

:global(
  .svelte-flow .svelte-flow__node .svelte-flow__handle[data-enabled="true"]
) {
  background-color: var(--color-bg-4);
  color: var(--color-text-hi-con);
}

:global(
  .svelte-flow .svelte-flow__node .svelte-flow__handle[data-enabled="false"]
) {
  background-color: var(--color-bg-2);
  color: var(--color-text-lo-con);
}
</style>
