<script lang="ts">
import { useOverlayUi } from '../overlayStore';
import type { ClientXY } from '../types';
import MenuLayer from './MenuLayer.svelte';


const overlayMenu = useOverlayUi(renderContextMenu);

async function openContextMenu(ev: MouseEvent) {
  ev.preventDefault();
  const clientXY: ClientXY = {x: ev.clientX, y: ev.clientY};
  const payload = {clientXY};
  const retValue = await overlayMenu.openOverlayAsync(payload);
  console.log(retValue);
}

</script>

<button class="trigger" oncontextmenu={openContextMenu}>
  <h2 class="title">Trigger area</h2>
  <span class="subtext">Right click to open menu</span>
</button>

{#snippet renderContextMenu()}
  <MenuLayer />
{/snippet}

<style>
.trigger {
  background-color: #2656aa;
  width: 40%;
  height: 25%;
  border-radius: 8px;
  padding: 4px 8px;
  font-weight: 400;
}
.title {
  font-size: 2em;
  font-weight: 200;
  letter-spacing: 0.4rem;
  color: #F0F0F0;
}
.subtext {
  color: rgb(224, 224, 224, 60%);
}
</style>