<script lang="ts">
import { onMount } from "svelte";

type Props = {
  entries: Map<string, string>;
};

const { entries }: Props = $props();

function setValue(key: string, value: string) {
  entries.set(key, value); // reactive automatically
}

const onInput = (key: string, ev: Event) => {
  const value = (ev.target as HTMLInputElement).value;
  setValue(key, value);
};

onMount(() => {
  // console.log(entries);
});
</script>

<div class="shell">
  {#each Array.from(entries) as [key, value]}
    <span class="lbl">{key}</span>
    <input
      class="txt"
      type="text"
      {value}
      oninput={(ev) => onInput(key, ev)}
    />
  {/each}
</div>

<style>
.shell {
  display: grid;
  grid-template-rows: auto;
  grid-template-columns: 1fr 3fr;
  max-width: 24rem;
  row-gap: var(--space-2);
}
.txt {
  background-color: var(--color-bg-1);
  padding: var(--space-2) var(--space-2);
  border-radius: var(--radius-md);
  font-family: var(--font-family-mono);
}
.lbl, .txt {
  font-size: var(--font-size-md);
  font-weight: var(--font-weight-medium);
  letter-spacing: var(--letter-spacing-normal);
  line-height: var(--line-height-tight);
}
</style>
