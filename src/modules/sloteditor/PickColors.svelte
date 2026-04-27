<script lang="ts">
import { onMount } from "svelte";
import {
  Button,
  type ButtonClickEvent,
  Color,
  type ColorChangeEvent,
  Separator,
} from "svelte-tweakpane-ui";

import type { plstate } from "@/types/plstate";

interface Props {
  initial: plstate.EncodedData | null;
  onData: (edited: plstate.EncodedData) => void;
}

const { initial, onData }: Props = $props();

let valueArray = $state<string[]>([]);
let lastColor: string = "#000000";

onMount(parseInitialIoData);

function onClickAdd(ev: ButtonClickEvent) {
  ev.preventDefault();
  valueArray.push($state.snapshot(lastColor));
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
  if (typeof p0 !== "string" || !p0.startsWith("#")) {
    console.warn("Invalid initial data for colors: ", initial);
    return;
  }

  let lastValue: string | undefined;
  for (const p of parsed) {
    valueArray.push(p);
    lastValue = p;
  }
  if (lastValue) {
    lastColor = lastValue;
  }
}

function onChangeCell(ev: any) {
  //_updated();
}
</script>

<div class="paneui">
  {#each valueArray as _, i (i)}
    <Color bind:value={valueArray[i]} on:change={onChangeCell} />
  {/each}
  <Separator />
  <Button on:click={onClickAdd} title="+" />
  <Button on:click={onClickApply} title="APPLY" />
</div>
