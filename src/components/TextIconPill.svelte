<script lang="ts">
import type { Component } from "svelte";

import { getAppIcon } from "@/utils/appIcons";

interface Props {
  text: string;
  icon?: string;
  onClick?: () => void;
  class?: string;
}

const {
  text,
  icon,
  onClick,
  class: className = "",
}: Props = $props();

const IconComp: Component | null = $derived(icon ? getAppIcon(icon) : null);
const isClickable = $derived(typeof onClick === "function");
</script>

{#if isClickable}
  <button type="button" class={["pill-root", className]} onclick={onClick}>
    <span class="pill-text">{text}</span>
    {#if IconComp}
      <span class="pill-separator" aria-hidden="true"></span>
      <span class="pill-icon" aria-hidden="true">
        <IconComp size={14} weight="regular" />
      </span>
    {/if}
  </button>
{:else}
  <span class={["pill-root", className]}>
    <span class="pill-text">{text}</span>
    {#if IconComp}
      <span class="pill-separator" aria-hidden="true"></span>
      <span class="pill-icon" aria-hidden="true">
        <IconComp size={14} weight="regular" />
      </span>
    {/if}
  </span>
{/if}

<style>
.pill-root {
  --pill-color: var(--tint-blue);
  display: inline-flex;
  align-items: center;
  vertical-align: top;
  max-width: 12rem;
  overflow: hidden;
  padding: 0.2rem 0.1rem;
  font-size: var(--font-size-xxs);
  border: 1px solid var(--color-border-subtle);
  border-radius: var(--radius-full);
  background: var(--pill-color);
  color: var(--color-text-hi-con);
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
}

button.pill-root {
  cursor: pointer;
  transition: background 0.12s ease;
}

button.pill-root:hover {
  background: color-mix(in srgb, var(--pill-color) 85%, var(--color-text-lo-con));
}

button.pill-root:focus-visible {
  outline: 2px solid var(--color-focus-ring);
  outline-offset: 2px;
}

.pill-text,
.pill-icon {
  display: inline-flex;
  align-items: center;
  min-height: 18px;
}

.pill-text {
  min-width: 0;
  padding: 0.15rem 0.45rem 0.15rem 0.65rem;
  font-family: var(--font-family-mono, monospace);
  line-height: 1;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.pill-separator {
  width: 1px;
  align-self: stretch;
  background: var(--color-border-subtle);
}

.pill-icon {
  flex-shrink: 0;
  justify-content: center;
  width: 1.3rem;
  color: var(--color-text-md-con);
}
</style>
