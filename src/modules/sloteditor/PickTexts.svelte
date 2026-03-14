<script lang="ts">
import { Button, Textarea, type ButtonClickEvent } from "svelte-tweakpane-ui";

interface Props {
  initial: object | null;
  onData: (typedPayload: object) => void;
}

const { initial, onData }: Props = $props();

let valueArray = $state<string[]>([]);

$effect.pre(() => {
  if (initial === null) return;
  valueArray = initial as string[];
});

function onClickAdd(ev: ButtonClickEvent) {
  ev.preventDefault();
  valueArray.push("");
}

function onClickApply(ev: ButtonClickEvent) {
  ev.preventDefault();
  onData($state.snapshot(valueArray));
}

function onChangeCell(ev: any) {}
</script>

<div class="paneui">
  {#each valueArray as _, i (i)}
    <Textarea bind:value={valueArray[i]} on:change={onChangeCell} rows={2} />
  {/each}
  <Button on:click={onClickAdd} title="+" />
  <Button on:click={onClickApply} title="APPLY" />
</div>

<style>
/* .paneui {
  --bld-vw: 50px;
  width: 120px;
  max-width: 200px;
} */
</style>
