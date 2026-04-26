<script lang="ts">
import { onMount } from "svelte";
import {
  Binding,
  Button,
  type ButtonClickEvent,
  Separator,
} from "svelte-tweakpane-ui";

import type { plstate } from "@/types/plstate";

interface Props {
  initial: plstate.EncodedData | null;
  onData: (edited: plstate.EncodedData) => void;
}

interface Float {
  n: number;
}

const { initial, onData }: Props = $props();

let valueArray = $state<Float[]>([]);

onMount(parseInitialIoData);

function onClickAdd(ev: ButtonClickEvent) {
  ev.preventDefault();
  valueArray.push({ n: 0 });
}

function onClickApply(ev: ButtonClickEvent) {
  ev.preventDefault();
  const valueArrayPlain = $state.snapshot(valueArray).map((v) => v.n);
  const data: plstate.EncodedData = {
    payload: JSON.stringify(valueArrayPlain),
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
  if (typeof p0 !== "number") {
    console.warn("Invalid initial data for PickFloats: ", initial);
    return;
  }
  for (const p of parsed) {
    valueArray.push({ n: p });
  }
}

function onChangeCell(ev: any) {
  //_updated();
}
</script>

<div>
  {#each valueArray as _, i (i)}
    <Binding bind:object={valueArray[i]} key="n" label="Value" />
  {/each}
  <Separator />
  <Button on:click={onClickAdd} title="ADD" />
  <Button on:click={onClickApply} title="APPLY" />
</div>
