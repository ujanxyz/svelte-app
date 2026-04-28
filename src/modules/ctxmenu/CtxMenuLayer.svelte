<script lang="ts">
import CaretRightIcon from "phosphor-svelte/lib/CaretRightIcon";
import { onMount, tick } from "svelte";

import { useOverlayInstance } from "@/modules/overlay2";

import { ctxMenuIconByCode } from "./icons";
import type {
  CtxMenuItem,
  CtxMenuLeafItem,
  CtxMenuPayload,
  CtxMenuSelection,
} from "./types";
import { isSeparatorItem, isSubmenuItem } from "./types";

const EDGE_PADDING = 8;
const SUBMENU_GAP = 6;

const overlay = useOverlayInstance<CtxMenuPayload<string>, CtxMenuSelection<string>>();

const items = overlay.payload.items;

let rootMenuEl = $state<HTMLUListElement | undefined>(undefined);
let submenuEl = $state<HTMLUListElement | undefined>(undefined);

let rootPos = $state.raw({ x: overlay.payload.x, y: overlay.payload.y });
let submenuPos = $state.raw({ x: 0, y: 0 });

let activeRootIndex = $state(0);
let activeSubmenuIndex = $state(0);
let activePanel = $state<"root" | "submenu">("root");

let openSubmenuFor = $state<number | null>(null);

const hasSubmenuOpen = $derived(openSubmenuFor !== null);
const submenuItems = $derived.by((): readonly CtxMenuLeafItem<string>[] => {
  if (openSubmenuFor === null) {
    return [];
  }

  const item = items[openSubmenuFor];
  if (!item || !isSubmenuItem(item)) {
    return [];
  }

  return item.submenu;
});

onMount(async () => {
  await tick();
  repositionRootMenu();
  const first = findNextEnabledIndex(items, -1, +1);
  if (first >= 0) {
    activeRootIndex = first;
    focusRoot(first);
  }
});

function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

function itemByRootIndex(index: number): CtxMenuItem<string> | null {
  if (index < 0 || index >= items.length) {
    return null;
  }

  return items[index] ?? null;
}

function findNextEnabledIndex(
  list: readonly { disabled?: boolean; separator?: true }[],
  startIndex: number,
  direction: 1 | -1,
): number {
  const count = list.length;
  if (count === 0) {
    return -1;
  }

  let next = startIndex;
  for (let i = 0; i < count; i += 1) {
    next = (next + direction + count) % count;
    const candidate = list[next];
    if (!candidate.disabled && !candidate.separator) {
      return next;
    }
  }

  return -1;
}

function rootButtonByIndex(index: number): HTMLButtonElement | null {
  return rootMenuEl?.querySelector<HTMLButtonElement>(
    `[data-root-index=\"${index}\"]`,
  ) ?? null;
}

function submenuButtonByIndex(index: number): HTMLButtonElement | null {
  return submenuEl?.querySelector<HTMLButtonElement>(
    `[data-sub-index=\"${index}\"]`,
  ) ?? null;
}

function focusRoot(index: number): void {
  rootButtonByIndex(index)?.focus();
}

function focusSubmenu(index: number): void {
  submenuButtonByIndex(index)?.focus();
}

function repositionRootMenu(): void {
  if (!rootMenuEl) {
    return;
  }

  const menuRect = rootMenuEl.getBoundingClientRect();
  const x = clamp(
    overlay.payload.x,
    EDGE_PADDING,
    window.innerWidth - menuRect.width - EDGE_PADDING,
  );
  const y = clamp(
    overlay.payload.y,
    EDGE_PADDING,
    window.innerHeight - menuRect.height - EDGE_PADDING,
  );

  rootPos = { x, y };
}

async function openSubmenuAt(rootIndex: number, anchorEl: HTMLElement): Promise<void> {
  const rootItem = itemByRootIndex(rootIndex);
  if (!rootItem || !isSubmenuItem(rootItem) || rootItem.submenu.length === 0) {
    return;
  }

  openSubmenuFor = rootIndex;
  activePanel = "submenu";

  const first = findNextEnabledIndex(rootItem.submenu, -1, +1);
  activeSubmenuIndex = first >= 0 ? first : 0;

  const anchorRect = anchorEl.getBoundingClientRect();
  submenuPos = {
    x: anchorRect.right + SUBMENU_GAP,
    y: anchorRect.top,
  };

  await tick();

  if (!submenuEl) {
    return;
  }

  const submenuRect = submenuEl.getBoundingClientRect();

  let x = anchorRect.right + SUBMENU_GAP;
  if (x + submenuRect.width > window.innerWidth - EDGE_PADDING) {
    x = anchorRect.left - submenuRect.width - SUBMENU_GAP;
  }

  const y = clamp(
    anchorRect.top,
    EDGE_PADDING,
    window.innerHeight - submenuRect.height - EDGE_PADDING,
  );

  submenuPos = { x, y };

  await tick();
  if (activeSubmenuIndex >= 0) {
    focusSubmenu(activeSubmenuIndex);
  }
}

function closeSubmenu(): void {
  openSubmenuFor = null;
  activePanel = "root";
}

function settleRootItem(rootIndex: number): void {
  const item = itemByRootIndex(rootIndex);
  if (!item || item.disabled || isSubmenuItem(item) || isSeparatorItem(item)) {
    return;
  }

  overlay.settle({
    code: item.code,
    pathLabels: [item.label],
    pathIndexes: [rootIndex],
    fromSubmenu: false,
  });
}

function settleSubmenuItem(subIndex: number): void {
  if (openSubmenuFor === null) {
    return;
  }

  const rootItem = items[openSubmenuFor];
  if (!isSubmenuItem(rootItem)) {
    return;
  }

  const item = rootItem.submenu[subIndex];
  if (!item || item.disabled) {
    return;
  }

  overlay.settle({
    code: item.code,
    pathLabels: [rootItem.label, item.label],
    pathIndexes: [openSubmenuFor, subIndex],
    fromSubmenu: true,
  });
}

function onRootPointerEnter(index: number, event: MouseEvent): void {
  activeRootIndex = index;
  activePanel = "root";

  const item = itemByRootIndex(index);
  if (!item || item.disabled) {
    return;
  }

  if (isSubmenuItem(item)) {
    const el = event.currentTarget as HTMLElement;
    void openSubmenuAt(index, el);
    return;
  }

  closeSubmenu();
}

function onRootClick(index: number, event: MouseEvent): void {
  const item = itemByRootIndex(index);
  if (!item || item.disabled) {
    return;
  }

  if (isSubmenuItem(item)) {
    const el = event.currentTarget as HTMLElement;
    void openSubmenuAt(index, el);
    return;
  }

  settleRootItem(index);
}

function onSubmenuPointerEnter(index: number): void {
  activePanel = "submenu";
  activeSubmenuIndex = index;
}

function handleKeydown(event: KeyboardEvent): void {
  if (["ArrowDown", "ArrowUp", "ArrowLeft", "ArrowRight", "Enter", " ", "Escape"].includes(event.key)) {
    event.preventDefault();
  } else {
    return;
  }

  if (event.key === "Escape") {
    overlay.abort();
    return;
  }

  if (activePanel === "root") {
    handleRootKeydown(event);
    return;
  }

  handleSubmenuKeydown(event);
}

function handleRootKeydown(event: KeyboardEvent): void {
  if (event.key === "ArrowDown" || event.key === "ArrowUp") {
    const direction = event.key === "ArrowDown" ? +1 : -1;
    const next = findNextEnabledIndex(items, activeRootIndex, direction);
    if (next >= 0) {
      activeRootIndex = next;
      focusRoot(next);

      const item = itemByRootIndex(next);
      if (!item || !isSubmenuItem(item)) {
        closeSubmenu();
      }
    }
    return;
  }

  const item = itemByRootIndex(activeRootIndex);
  if (!item || item.disabled) {
    return;
  }

  if (event.key === "ArrowRight") {
    if (!isSubmenuItem(item)) {
      return;
    }

    const anchorEl = rootButtonByIndex(activeRootIndex);
    if (anchorEl) {
      void openSubmenuAt(activeRootIndex, anchorEl);
    }
    return;
  }

  if (event.key === "Enter" || event.key === " ") {
    if (isSubmenuItem(item)) {
      const anchorEl = rootButtonByIndex(activeRootIndex);
      if (anchorEl) {
        void openSubmenuAt(activeRootIndex, anchorEl);
      }
      return;
    }

    settleRootItem(activeRootIndex);
  }
}

function handleSubmenuKeydown(event: KeyboardEvent): void {
  if (!hasSubmenuOpen) {
    activePanel = "root";
    return;
  }

  const list = submenuItems;

  if (event.key === "ArrowDown" || event.key === "ArrowUp") {
    const direction = event.key === "ArrowDown" ? +1 : -1;
    const next = findNextEnabledIndex(list, activeSubmenuIndex, direction);
    if (next >= 0) {
      activeSubmenuIndex = next;
      focusSubmenu(next);
    }
    return;
  }

  if (event.key === "ArrowLeft") {
    closeSubmenu();
    focusRoot(activeRootIndex);
    return;
  }

  if (event.key === "Enter" || event.key === " ") {
    settleSubmenuItem(activeSubmenuIndex);
  }
}
</script>

<svelte:window onkeydown={handleKeydown} />

<ul
  class="ctxmenu"
  role="menu"
  bind:this={rootMenuEl}
  style:left="{rootPos.x}px"
  style:top="{rootPos.y}px"
>
  {#each items as item, index (item.label + "-" + index)}
    {#if isSeparatorItem(item)}
      <li role="separator" class="ctxmenu-separator"><hr /></li>
    {:else}
      <li role="none" class="ctxmenu-row">
        <button
          type="button"
          role="menuitem"
          class="ctxmenu-item"
          class:disabled={!!item.disabled}
          data-root-index={index}
          aria-haspopup={isSubmenuItem(item) ? "menu" : undefined}
          aria-expanded={isSubmenuItem(item) && openSubmenuFor === index ? "true" : undefined}
          aria-disabled={item.disabled ? "true" : undefined}
          onclick={(event) => onRootClick(index, event)}
          onmouseenter={(event) => onRootPointerEnter(index, event)}
        >
          <span class="left">
            {#if item.icon}
              {@const Icon = ctxMenuIconByCode[item.icon]}
              <Icon size={14} weight="bold" />
            {:else}
              <span class="icon-placeholder"></span>
            {/if}
            <span class="label">{item.label}</span>
          </span>

          <span class="right">
            {#if item.shortcut}
              <span class="shortcut">{item.shortcut}</span>
            {/if}
            {#if isSubmenuItem(item)}
              <CaretRightIcon size={12} />
            {/if}
          </span>
        </button>
      </li>
    {/if}
  {/each}
</ul>

{#if hasSubmenuOpen}
  <ul
    class="ctxmenu submenu"
    role="menu"
    bind:this={submenuEl}
    style:left="{submenuPos.x}px"
    style:top="{submenuPos.y}px"
  >
    {#each submenuItems as item, index (item.label + "-" + index)}
      <li role="none" class="ctxmenu-row">
        <button
          type="button"
          role="menuitem"
          class="ctxmenu-item"
          class:disabled={!!item.disabled}
          data-sub-index={index}
          aria-disabled={item.disabled ? "true" : undefined}
          onclick={() => settleSubmenuItem(index)}
          onmouseenter={() => onSubmenuPointerEnter(index)}
        >
          <span class="left">
            {#if item.icon}
              {@const Icon = ctxMenuIconByCode[item.icon]}
              <Icon size={14} weight="bold" />
            {:else}
              <span class="icon-placeholder"></span>
            {/if}
            <span class="label">{item.label}</span>
          </span>

          <span class="right">
            {#if item.shortcut}
              <span class="shortcut">{item.shortcut}</span>
            {/if}
          </span>
        </button>
      </li>
    {/each}
  </ul>
{/if}

<style>
.ctxmenu {
  position: fixed;
  min-width: 220px;
  list-style: none;
  margin: 0;
  padding: 6px;
  border: 1px solid #d1d5db;
  border-radius: 10px;
  background: #ffffff;
  box-shadow: 0 14px 30px rgba(0, 0, 0, 0.2);
  z-index: 1;
}

.ctxmenu-row {
  margin: 0;
  padding: 0;
}

.ctxmenu-item {
  width: 100%;
  border: none;
  background: transparent;
  border-radius: 7px;
  color: #1f2937;
  padding: 7px 9px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  text-align: left;
  cursor: pointer;
}

.ctxmenu-item:hover,
.ctxmenu-item:focus-visible {
  outline: none;
  background: #edf2ff;
}

.ctxmenu-item.disabled {
  cursor: not-allowed;
  opacity: 0.45;
}

.ctxmenu-item.disabled:hover,
.ctxmenu-item.disabled:focus-visible {
  background: transparent;
}

.left {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  min-width: 0;
}

.right {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  color: #6b7280;
}

.icon-placeholder {
  width: 14px;
  height: 14px;
}

.label {
  font-size: 0.875rem;
  white-space: nowrap;
}

.shortcut {
  font-size: 0.75rem;
  letter-spacing: 0.01em;
  color: #6b7280;
}

.ctxmenu-separator {
  margin: 4px 0;
  padding: 0;
  list-style: none;
}

.ctxmenu-separator hr {
  border: none;
  border-top: 1px solid #e5e7eb;
  margin: 0 6px;
}
</style>
