<script lang="ts">
import { onMount } from "svelte";
import {
  Button,
  type ButtonClickEvent,
  Color,
  type ColorChangeEvent,
} from "svelte-tweakpane-ui";

interface Props {
  initial: object | null;
  onData: (typedPayload: object) => void;
}

const { initial, onData }: Props = $props();

let valueArray = $state<string[]>([]);
let lastColor: string = "#000000";

onMount(() => {
  if (initial === null) return;
  valueArray = initial as string[];
});

function onClickAdd(ev: ButtonClickEvent) {
  ev.preventDefault();
  valueArray.push(lastColor);
  _updated();
}

function onClickApply(ev: ButtonClickEvent) {
  ev.preventDefault();
  onData($state.snapshot(valueArray));
}

function onChangeCell(ev: ColorChangeEvent) {
  const { value: color } = ev.detail;
  if (typeof color === "string") {
    lastColor = color;
  }
  _updated();
}

function _updated() {
  // TODO: Maybe support preview / auto-sync of node data while editing in popup.
}
</script>

<div class="paneui">
  {#each valueArray as _, i (i)}
    <Color bind:value={valueArray[i]} on:change={onChangeCell} />
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
