<script lang="ts">
import { onMount } from "svelte";
import {
  Button,
  type ButtonClickEvent,
  Point,
  type PointValue2d,
} from "svelte-tweakpane-ui";

interface Props {
  initial: object | null;
  onData: (typedPayload: object) => void;
}

const { initial, onData }: Props = $props();

let valueArray = $state<PointValue2d[]>([]);

onMount(() => {
  if (initial === null) return;
  valueArray = initial as PointValue2d[];
});

function onClickAdd(ev: ButtonClickEvent) {
  ev.preventDefault();
  valueArray.push({ x: 0, y: 0 });
  //_updated();
}

function onClickApply(ev: ButtonClickEvent) {
  ev.preventDefault();
  onData($state.snapshot(valueArray));
}

function onChangeCell(ev: any) {
  //_updated();
}
</script>

<div class="paneui">
  {#each valueArray as _, i (i)}
    <Point bind:value={valueArray[i]} on:change={onChangeCell} />
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
