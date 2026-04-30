<script lang="ts">
import { onMount } from "svelte";
import {
  Button,
  type ButtonClickEvent,
  Point,
  type PointValue2d,
  Separator,
} from "svelte-tweakpane-ui";

import type { plstate } from "@/types/plstate";

interface Props {
  initial: plstate.EncodedData | null;
  onData: (edited: plstate.EncodedData) => void;
}

const { initial, onData }: Props = $props();

let valueArray = $state<PointValue2d[]>([]);

onMount(parseInitialIoData);

function onClickAdd(ev: ButtonClickEvent) {
  ev.preventDefault();
  valueArray.push({ x: 0, y: 0 });
}

function onClickApply(ev: ButtonClickEvent) {
  ev.preventDefault();
  const data: plstate.EncodedData = {
    payload: JSON.stringify($state.snapshot(valueArray)),
  };
  onData(data);
}


function parseInitialIoData(): void {
  if (!initial || typeof initial !== "object" || !("payload" in initial)) return;
  const payload = initial.payload;
  if (typeof payload !== "string") return;
  let parsed: any;
  try {
    parsed = JSON.parse(payload);
  } catch (e) {
    console.warn("Failed to parse initial payload as JSON: ", payload);
    return;
  }
  if (!Array.isArray(parsed) || parsed.length === 0) return;
  const p0 = parsed[0];
  if (typeof p0 !== "object" || p0 === null || !("x" in p0) || !("y" in p0)) {
    console.warn("Invalid initial data for PickCoords2D: ", initial);
    return;
  }
  for (const p of parsed) {
    valueArray.push({ x: p.x, y: p.y });
  }
}

function onChangeCell(ev: any) {
  //_updated();
}
</script>

<div>
  {#each valueArray as _, i (i)}
    <Point bind:value={valueArray[i]} on:change={onChangeCell} />
  {/each}
  <Separator />
  <Button on:click={onClickAdd} title="ADD" />
  <Button on:click={onClickApply} title="APPLY" />
</div>
