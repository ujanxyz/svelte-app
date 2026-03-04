<script lang="ts">
import OutlinedSvgIcon from "../icons/OutlinedSvgIcon.svelte";

type Props = {
  tooltip: string;
  onclick: () => void;
};
const { tooltip, onclick }: Props = $props();
</script>

<button onclick={onclick} class="rounded-sm" title={tooltip}>
  <OutlinedSvgIcon />
</button>

<style>
button {
  /* --comp-icon-btn-border-col: ; */
  /* --comp-icon-btn-border-col-hover: ; */
  /* --comp-icon-btn-bg: ; */
  /* --comp-icon-btn-bg-hover: ; */

  --stroke-width: 1.5;
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
  --stroke-width: 1.8;
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
