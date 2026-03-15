<script lang="ts">
import ClipboardIcon from "phosphor-svelte/lib/ClipboardIcon";
import CodeIcon from "phosphor-svelte/lib/CodeIcon";
import LineVerticalIcon from "phosphor-svelte/lib/LineVerticalIcon";
import PentagonIcon from "phosphor-svelte/lib/PentagonIcon";
import StackMinusIcon from "phosphor-svelte/lib/StackMinusIcon";
import StackPlusIcon from "phosphor-svelte/lib/StackPlusIcon";

import { useOverlayUi } from "../overlayStore";
import type { ClientXY, StatusOr } from "../types";
import demoMenuData from "./demoMenuData";
import MenuLayer from "./MenuLayer.svelte";

const overlayMenu = useOverlayUi(renderContextMenu);

export async function showMenu(ev: MouseEvent): Promise<StatusOr<string>> {
  ev.preventDefault();
  const clientXY: ClientXY = { x: ev.clientX, y: ev.clientY };
  return await overlayMenu.openOverlayAsync<string>({ clientXY });
}

const icons = {
  new: pentagonIcon,
  "stack+": stackPlusIcon,
  "stack-": stackMinusIcon,
  copy: clipboardIcon,
  code: codeIcon,
};
</script>

{#snippet renderContextMenu()}
  <MenuLayer menuItems={demoMenuData} {icons} defaultIcon={lineVerticalIcon} />
{/snippet}

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

{#snippet lineVerticalIcon()}
  <LineVerticalIcon size={24} />
{/snippet}
