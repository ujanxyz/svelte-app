<script lang="ts">
import { useOverlayInstance } from "@/modules/overlay2";
import type { fn } from "@/types/function";
import FunctionCard from "./FunctionCard.svelte";

interface Props {
  items: fn.FunctionInfo[];
}

const { items }: Props = $props();

const overlay = useOverlayInstance<unknown, fn.FunctionInfo | fn.GraphIoInfo>();

function onSelect(spec: fn.FunctionInfo) {
  overlay.settle(spec);
}
</script>

<div class="contentroot">
  <div class="gridbox">
    {#if items.length === 0}
      <p class="empty-label">No functions match the current filters.</p>
    {/if}
    {#each items as item (item.uri)}
      <FunctionCard spec={item} {onSelect} />
    {/each}
  </div>
</div>

<style>
/* .elevated-rounded-md {
  border-radius: 4px;
  box-shadow:
    0px 11px 15px -7px rgba(var(--box-shadow-rgb), 0.2),
    0px 24px 38px 3px rgba(var(--box-shadow-rgb), 0.14),
    0px 9px 46px 8px rgba(var(--box-shadow-rgb), 0.12);
} */

.contentroot {
  flex: 1 1 0%;
  overflow-y: auto;

  display: flex;
  align-items: stretch;
  flex-direction: column;
}

.gridbox {
  width: 100%;
  max-height: 100%;

  flex: 1;
  align-self: flex-start;

  padding: 18px 12px 12px 12px;

  display: flex;
  justify-content: center;
  align-items: flex-start;
  align-content: flex-start;
  flex-wrap: wrap;
  overflow-y: auto;
  row-gap: 18px;
  column-gap: 12px;
}

.empty-label {
  margin-top: 24px;
  color: var(--color-text-md-con);
  font-size: 0.9rem;
}
</style>