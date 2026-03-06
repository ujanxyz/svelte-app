<script lang="ts">
import type { ClientXY } from "../types";
import useCurrentOverlay from "../useCurrentOverlay";
import type { MenuItem, MenuRow } from "./menu";

import CheckIcon from "phosphor-svelte/lib/CheckIcon";

interface Props {
  menuItems: MenuItem[];
}

const { menuItems }: Props = $props();

let clientXY = $state<ClientXY>({x: 0, y: 0});

/**
 * CSS vars controlling the menu position.
 */
const styleString: string = $derived(`--left: ${clientXY.x}px; --top: ${clientXY.y}px;`);

const current = useCurrentOverlay();

$effect.pre(() => {
  const { clientXY: payloadXY } = current.getLayerPayload();
  clientXY = payloadXY;
});

function onClickMenuItem(ev: MouseEvent): void {
  const menuCode = (ev.currentTarget as HTMLButtonElement).dataset.menuCode as string;
  current.settleOverlay("MENU_SELECTED");
  console.log("Handle code: ", menuCode);
}

</script>

<div class="layer contextmenu" style={styleString}>
  {#each menuItems as item}
    {#if item === "-"}
      <hr class="sep" />
    {:else}
      {@const { code, icon, label, shortcut } = item as MenuRow}
      <button onclick={onClickMenuItem} class="row" data-menu-code={code}>
        {#if !!icon }
          {@render icon()}
        {/if}
        <span class="label">{label}</span>
        {#if shortcut}
          <span class="shortcut">{shortcut}</span>
        {/if}
      </button>
    {/if}
  {/each}
</div>

<style>
.layer {
  left: var(--left);
  top: var(--top);
  background-color: gold;
  min-width: 240px;
  min-height: 64px;
  border-radius: 6px;
  overflow: hidden;
  box-shadow: 4px 4px 6px 2px rgba(0, 0, 0, 0.2);
  position: fixed;
  transform: translate(
    calc(-50% + 200px + var(--card-index) * -40px),
    calc(-50% + -300px + var(--card-index) * 60px)
  );
}

.contextmenu {
  display: flex;
  flex-direction: column;
  padding-top: calc(0.2rem + 1px);
  padding-bottom: calc(0.2rem + 1px);

  font-size: 0.9rem;
  color: #ddddff;

  background-color: #222222;
  border: 1px solid #dddddd44;
  border-radius: 4px;
  gap: 2px;

  animation: dropdown-in 200ms ease;
}
hr.sep {
  border-top: 1px solid #dddddd44;
  border-bottom: none;
  width: 100%;
  border-left: 0px;
  border-right: 0px;
  margin: 0.2rem 0px;
  box-sizing: border-box;
}
.row {
  padding: 0.5rem 10px;
  background: none;
  border: none;
  color: inherit;

  display: flex;
  flex-direction: row;
  align-items: center;
  column-gap: 12px;
  text-align: left;
  cursor: pointer;
}
.label {
  flex-grow: 1;
}

button:hover {
  background: #88888844;
}
.shortcut {
  color: #666;
  font-size: 0.8em;
}

@keyframes dropdown-in {
  from {
    opacity: 0;
    transform: translateY(-8px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

</style>
