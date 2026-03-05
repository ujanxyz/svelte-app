<script lang="ts">
import type { Snippet } from "svelte";

type Props = {
  children: Snippet;
  onclick: () => void;
  tooltip: string;
};
const { children, onclick, tooltip }: Props = $props();
</script>

<button onclick={onclick} class="rounded-sm" title={tooltip}>
  {@render children()}
</button>

<style>
button {
  padding: var(--space-1) var(--space-2);
  background-color: var(--color-bg-3);
  color: var(--color-text-md-con);
  border-width: 1px;
  border-style: solid;
  border-color: var(--comp-icon-btn-border-col, var(--color-border-subtle));

  display: inline-flex;
  align-items: center;
  cursor: pointer;
}

button:hover {
  background-color: var(--color-bg-4);
  color: var(--color-text-hi-con);
  border-color: var(
    --comp-icon-btn-border-col-hover,
    var(--color-border-default)
  );
}

button:active {
  outline: 2px solid var(--color-accent);
  outline-offset: 2px;
}
</style>
