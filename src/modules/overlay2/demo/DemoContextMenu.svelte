<script lang="ts">
import { overlayStatuses, useOverlayInstance } from "../index";

interface MenuPayload {
  x: number;
  y: number;
}

type MenuAction = "copy" | "paste" | "delete" | "rename";

interface MenuItem {
  label: string;
  action: MenuAction;
}

const MENU_ITEMS: MenuItem[] = [
  { label: "Copy", action: "copy" },
  { label: "Paste", action: "paste" },
  { label: "Rename", action: "rename" },
  { label: "Delete", action: "delete" },
];

const overlay = useOverlayInstance<MenuPayload, MenuAction>();

function select(action: MenuAction): void {
  overlay.settle(action);
}
</script>

<div class="shell"
  style:left="{overlay.payload.x}px"
  style:top="{overlay.payload.y}px"
>
<ul
  class="menu"
  role="menu"
>
  {#each MENU_ITEMS as item (item.action)}
    <li role="none">
      <button
        type="button"
        role="menuitem"
        class="menu-item"
        class:danger={item.action === "delete"}
        onclick={() => select(item.action)}
      >
        {item.label}
      </button>
    </li>
  {/each}
</ul>
<div>
  No clickable area.<br/>
  Clicking here should have no effect on the context menu.
</div>
</div>

<style>
.shell {

  min-width: 160px;


  background: #ffffff;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.14);
}


.menu {
  list-style: none;
  margin: 0;
  padding: 4px 0;
}

.menu-item {
  display: block;
  width: 100%;
  padding: 8px 16px;
  font-size: 0.875rem;
  text-align: left;
  background: none;
  border: none;
  cursor: pointer;
  color: #374151;
}

.menu-item:hover {
  background: #f3f4f6;
}

.menu-item.danger {
  color: #dc2626;
}

.menu-item.danger:hover {
  background: #fef2f2;
}
</style>
