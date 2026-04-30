<script lang="ts">
import * as ctxmenu from "@/modules/ctxmenu";
import * as overlay2 from "@/modules/overlay2";

const overlayMgr = overlay2.useOverlayManager();

export const menuItems: readonly ctxmenu.CtxMenuItem<string>[] = [
  {
    label: "Run Selected Nodes",
    code: "RUN",
    icon: "arrow-clockwise",
  },
  {
    label: "",
    separator: true,
  },
  {
    label: "Delete Selected",
    code: "DELETE",
    icon: "trash",
  },
];

async function openContextMenu(ev: MouseEvent) {
  ev.preventDefault();
  const menuResult = await ctxmenu.openCtxMenu<string>(overlayMgr, renderContextMenu, {
    x: ev.clientX,
    y: ev.clientY,
    items: menuItems,
  });
  if (menuResult.status === overlay2.overlayStatuses.OK) {
    console.log("Success: ", menuResult.value);
  } else {
    console.log("Failed status: ", menuResult.status);
  }
}
</script>

<button class="trigger" oncontextmenu={openContextMenu}>
  <h2 class="title">Trigger area</h2>
  <span class="subtext">Right click to open menu</span>
</button>

{#snippet renderContextMenu()}
  <ctxmenu.CtxMenuLayer />
{/snippet}

<style>
.trigger {
  background-color: var(--color-dark-bg-3);
  width: 40%;
  height: 25%;
  border-radius: var(--radius-lg);
}
.title {
  font-size: var(--font-size-xxl);
  font-weight: var(--font-weight-bold);
  letter-spacing: 0.5rem;
  color: var(--color-dark-text-hi-con);
}
.subtext {
  color: var(--color-dark-text-lo-con);
  font-weight: var(--font-weight-light);
}
</style>
