<script lang="ts">
import type { Snippet } from "svelte";

type Props = {
  children: Snippet;
  onclick: () => void;
  tooltip: string;
};
const { children, onclick, tooltip }: Props = $props();
</script>

<button {onclick} class="btn" title={tooltip}>
  {@render children()}
</button>

<style>
.btn {
  padding: var(--space-1) var(--space-2);
  border: 1px solid var(--border-subtle);
  border-radius: var(--radius-sm);

  display: inline-flex;
  align-items: center;
  cursor: pointer;

  font-family: var(--font-family-sans);

  background-color: var(--color-bg-3);
  color: var(--color-text-hi-con);
}

.btn:hover {
  background-color: var(--color-bg-4);
}

.btn:focus-within {
  outline: 2px solid var(--color-accent);
  outline-offset: 2px;
}
</style>
