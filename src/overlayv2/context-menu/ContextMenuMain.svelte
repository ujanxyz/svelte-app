<script lang="ts">
import { useOverlayUi } from '../overlayStore';
import type { ClientXY } from '../types';
import type { MenuItem } from './menu';
import MenuLayer from './MenuLayer.svelte';

// Icons.
import PentagonIcon from "phosphor-svelte/lib/PentagonIcon";
import StackPlusIcon from "phosphor-svelte/lib/StackPlusIcon";
import StackMinusIcon from "phosphor-svelte/lib/StackMinusIcon";
import CodeIcon from "phosphor-svelte/lib/CodeIcon";
import ClipboardIcon from "phosphor-svelte/lib/ClipboardIcon";

const overlayMenu = useOverlayUi(renderContextMenu);

const menuItems: MenuItem[] = [
  { code: "new",  icon: pentagonIcon, label: "New Shape ..." },
  "-",
  { code: "stack+", icon: stackPlusIcon, label: "Push layer", shortcut: "Ctrl+S" },
  { code: "stack-", icon: stackMinusIcon, label: "Pop layer", shortcut: "Ctrl+S" },
  "-",
  { code: "copy", icon: clipboardIcon, label: "Copy shape", shortcut: "Ctrl+C" },
  { code: "code", icon: codeIcon, label: "View code" },
];

async function openContextMenu(ev: MouseEvent) {
  ev.preventDefault();
  const clientXY: ClientXY = {x: ev.clientX, y: ev.clientY};
  const payload = {clientXY};
  const retValue = await overlayMenu.openOverlayAsync(payload);
  console.log(retValue);
}

</script>

{#snippet pentagonIcon()}
  <PentagonIcon size={24} />
{/snippet}

{#snippet stackPlusIcon()}
  <StackPlusIcon size={24} />
{/snippet}

{#snippet stackMinusIcon()}
  <StackMinusIcon size={24} />
{/snippet}

{#snippet clipboardIcon()}
  <ClipboardIcon size={24} />
{/snippet}

{#snippet codeIcon()}
  <CodeIcon size={24} />
{/snippet}

<button class="trigger" oncontextmenu={openContextMenu}>
  <h2 class="title">Trigger area</h2>
  <span class="subtext">Right click to open menu</span>
</button>

{#snippet renderContextMenu()}
  <MenuLayer menuItems={menuItems} />
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