<script lang="ts">
import MiniCard from "./MiniCard.svelte";
import type { MasonryLayoutData } from "./types";

// Icons.
import CloudRainIcon from "phosphor-svelte/lib/CloudRainIcon";
import CodeIcon from "phosphor-svelte/lib/CodeIcon";
import LightningIcon from "phosphor-svelte/lib/LightningIcon";
import PaletteIcon from "phosphor-svelte/lib/PaletteIcon";
import TrainIcon from "phosphor-svelte/lib/TrainIcon";
import TreeIcon from "phosphor-svelte/lib/TreeIcon";
import { makeRandomPicker } from "../../utils/random";

interface Props {
  gridData: MasonryLayoutData;
}
const { gridData }: Props = $props();

const iconPicker = makeRandomPicker(
  [cloudRainIcon, codeIcon, lightningIcon, paletteIcon, trainIcon, treeIcon],
  0,
);
</script>

<div class="container" style="styleString">
  {#each gridData as column: ColumnLayoutData}
    <div class="column">
      {#each column as cellData: CellData}
        {@const cellIcon = iconPicker.pick()}
        <MiniCard {cellData} {cellIcon} />
      {/each}
    </div>
  {/each}
</div>

{#snippet cloudRainIcon()}
  <CloudRainIcon size={24} class="phosphor-icon" />
{/snippet}

{#snippet codeIcon()}
  <CodeIcon size={24} />
{/snippet}

{#snippet lightningIcon()}
  <LightningIcon size={24} />
{/snippet}

{#snippet paletteIcon()}
  <PaletteIcon size={24} />
{/snippet}

{#snippet trainIcon()}
  <TrainIcon size={24} />
{/snippet}

{#snippet treeIcon()}
  <TreeIcon size={24} class="phosphor-icon" />
{/snippet}

<style>
.container {
  --cell-spacing: 8px;
  --cell-corner-radius: 6px;
  color: #f0f0f0;
  border-radius: 4px;
  width: inherit;
  height: inherit;

  display: flex;
  flex-direction: row;
  flex-wrap: nowrap;
  justify-content: space-between;
  align-items: stretch;
  column-gap: var(--cell-spacing);
}
.column {
  flex-grow: 1;
  display: flex;
  flex-direction: column;
  flex-wrap: nowrap;
  justify-content: flex-start;
  align-items: stretch;
  row-gap: 0;
}
</style>
