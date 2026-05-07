<script lang="ts">
import type { Snippet } from "svelte";

import { getAppIcon } from "@/utils/appIcons";

interface Props {
  title: string;
  children?: Snippet;
  /** Extra CSS class applied to the sliding panel element (use for tint/bg overrides). */
  panelClass?: string;
}

const {
  title,
  children,
  panelClass = "",
}: Props = $props();

let open = $state(true);

const ListIcon = getAppIcon("list");

function toggle() {
  open = !open;
}
</script>

<!--
  Root element is absolutely positioned to fill the parent.
  pointer-events: none prevents blocking clicks on content beneath;
  interactive children restore pointer-events individually.
-->
<div class="drawer-host">
  <!-- Floating toggle shown only when closed -->
  <button
    class="float-toggle"
    class:hidden={open}
    onclick={toggle}
    aria-label="Open drawer"
    tabindex={open ? -1 : 0}
  >
    <ListIcon size={20} weight="bold" />
  </button>

  <!-- Sliding panel -->
  <div class={["drawer-panel", panelClass, open && "open"]} aria-hidden={!open}>
    <div class="drawer-header">
      <span class="drawer-title">{title}</span>
      <button class="header-toggle" onclick={toggle} aria-label="Close drawer" tabindex={open ? 0 : -1}>
        <ListIcon size={20} weight="bold" />
      </button>
    </div>

    <div class="drawer-body">
      {@render children?.()}
    </div>
  </div>
</div>

<style>
.drawer-host {
  position: absolute;
  inset: 0;
  z-index: 8;
  pointer-events: none;
  /* Clip the panel while it slides off-screen */
  overflow: hidden;
}

/* ── Floating toggle (collapsed state) ─────────────────────────── */
.float-toggle {
  position: absolute;
  top: 0.4rem;
  left: 0.5rem;
  z-index: 11;
  pointer-events: none;

  display: flex;
  align-items: center;
  justify-content: center;


  width: 2.1rem;
  height: 2.1rem;
  border-radius: var(--radius-sm, 6px);
  border: 1px solid var(--color-border-subtle);
  background: var(--color-bg-2);
  color: var(--text-primary, var(--color-text-hi-con));
  cursor: pointer;
  opacity: 1;
  transition: background 0.12s ease, opacity 0.1s ease 0.1s;
}

.float-toggle:hover {
  background: var(--interactive-muted-bg-hover, var(--color-bg-3));
}

.float-toggle.hidden {
  opacity: 0;
  transition-delay: 0s;
}

.float-toggle:not(.hidden) {
  pointer-events: auto;
}

/* ── Sliding panel ──────────────────────────────────────────────── */
.drawer-panel {
  position: absolute;
  top: 0;
  left: 0;
  z-index: 1;
  height: 100%;
  width: 20%;
  min-width: 10rem;
  max-width: 20rem;

  box-shadow: var(--elevation-shadow-x);

  display: flex;
  flex-direction: column;
  overflow: hidden;
  pointer-events: auto;

  /* Start off-screen; animate in on .open */
  transform: translateX(calc(-100% - 28px));
  transition: transform 0.2s cubic-bezier(0.4, 0, 0.2, 1);
}

.drawer-panel.open {
  transform: translateX(0);
}

/* ── Header row ─────────────────────────────────────────────────── */
.drawer-header {
  display: flex;
  align-items: center;
  padding: 0.55rem 0.5rem 0.55rem 0.85rem;
  border-bottom: 1px solid var(--color-border-subtle);
  gap: 0.5rem;
  flex-shrink: 0;
}

.drawer-title {
  flex: 1 1 0%;
  font-weight: 700;
  font-size: 0.88rem;
  letter-spacing: 0.01em;
  color: var(--text-primary, var(--color-text-hi-con));
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.header-toggle {
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 1.9rem;
  height: 1.9rem;
  border-radius: var(--radius-sm, 6px);
  border: none;
  background: transparent;
  color: var(--text-secondary, var(--color-text-md-con));
  cursor: pointer;
  transition: background 0.12s ease;
}

.header-toggle:hover {
  background: color-mix(in srgb, currentColor 12%, transparent);
}

/* ── Body content ───────────────────────────────────────────────── */
.drawer-body {
  flex: 1 1 0%;
  overflow-y: auto;
  overflow-x: hidden;
}
</style>
