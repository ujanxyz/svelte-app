<script lang="ts">
import * as ctxmenu from "@/modules/ctxmenu";
import DemoDialog, { type DialogPayload } from "@/modules/overlay2/demo/DemoDialog.svelte";
import * as overlay2 from "@/modules/overlay2/index";


// Shared manager for this local demo surface.
const manager = overlay2.createOverlayManager();

// --- dialog ---

const dialog = overlay2.createOverlayController<DialogPayload, boolean>(
  manager,
  renderDialog,
);

let dialogResult = $state<string>("—");

async function openDialog(): Promise<void> {
  const result: overlay2.OverlayResult<boolean> = await dialog.open({
    title: "Confirm action",
    message: "Are you sure you want to proceed? This cannot be undone.",
  }, {
    dismissOnBackdrop: false,
  });

  if (result.status === overlay2.overlayStatuses.OK) {
    dialogResult = result.value ? "Confirmed ✓" : "Declined";
  } else {
    dialogResult = `Closed (${result.status})`;
  }
}

// --- context menu ---

type MenuAction =
  | "copy"
  | "paste"
  | "delete"
  | "rename"
  | "export-png"
  | "export-svg";

const menuItems: readonly ctxmenu.CtxMenuItem<MenuAction>[] = [
  {
    label: "Copy",
    code: "copy",
    icon: "clipboard",
    shortcut: "Cmd+C",
  },
  {
    label: "Paste",
    code: "paste",
    icon: "plus",
    shortcut: "Cmd+V",
  },
  {
    label: "Rename",
    code: "rename",
    icon: "pencil",
    shortcut: "R",
  },
  {
    label: "",
    separator: true,
  },
  {
    label: "Export",
    icon: "line-vertical",
    submenu: [
      {
        label: "As PNG",
        code: "export-png",
        icon: "info",
        shortcut: "P",
      },
      {
        label: "As SVG",
        code: "export-svg",
        icon: "code",
        shortcut: "S",
      },
    ],
  },
  {
    label: "",
    separator: true,
  },
  {
    label: "Delete",
    code: "delete",
    icon: "trash",
    shortcut: "Del",
  },
];

let menuResult = $state<string>("—");

async function openContextMenu(event: MouseEvent): Promise<void> {
  const result = await ctxmenu.openCtxMenu<MenuAction>(manager, renderContextMenu, {
    x: event.clientX,
    y: event.clientY,
    items: menuItems,
  });

  if (result.status === overlay2.overlayStatuses.OK) {
    menuResult = `Selected: ${result.value.code} (${result.value.pathLabels.join(" > ")})`;
  } else {
    menuResult = `Closed (${result.status})`;
  }
}
</script>

<overlay2.OverlayRoot {manager}>
  <div class="tester">
    <h2 class="heading">overlay2 demo</h2>

    <div class="row">
      <button class="btn btn-primary" onclick={openDialog}>
        Open modal dialog
      </button>
      <span class="result">Result: {dialogResult}</span>
    </div>

    <div class="row">
      <button class="btn btn-secondary" onclick={openContextMenu}>
        Open context menu
      </button>
      <span class="result">Result: {menuResult}</span>
    </div>
  </div>
</overlay2.OverlayRoot>

{#snippet renderDialog()}
  <DemoDialog />
{/snippet}

{#snippet renderContextMenu()}
  <ctxmenu.CtxMenuLayer />
{/snippet}

<style>
.tester {
  display: flex;
  flex-direction: column;
  gap: 24px;
  padding: 40px;
  font-family: system-ui, sans-serif;
}

.heading {
  font-size: 1.25rem;
  font-weight: 600;
  margin: 0;
  color: #171717;
}

.row {
  display: flex;
  align-items: center;
  gap: 16px;
}

.btn {
  padding: 8px 20px;
  border-radius: 7px;
  font-size: 0.9rem;
  font-weight: 500;
  cursor: pointer;
  border: 1px solid transparent;
}

.btn-primary {
  background: #2563eb;
  color: #fff;
}

.btn-primary:hover {
  background: #1d4ed8;
}

.btn-secondary {
  background: #f3f4f6;
  color: #374151;
  border-color: #d1d5db;
}

.btn-secondary:hover {
  background: #e5e7eb;
}

.result {
  font-size: 0.875rem;
  color: #6b7280;
}
</style>
