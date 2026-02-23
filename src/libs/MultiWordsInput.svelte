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

<div class="container">
    {#each Array.from(entries) as [key, value]}
      <span class="txt-sm-strong">{key}</span>
      <input class="txt-sm-strong" type="text" value={value} oninput={(ev) => onInput(key, ev)} />
    {/each}
</div>

<style>
.container {
    width: 10rem;
    --spacer-2: 0.5rem;
    --spacer-2: 1.0rem;
    display: grid;
    grid-template-rows: auto;
    grid-template-columns: 4rem 1fr;
    row-gap: 4px;
}
</style>