<script lang="ts">
  import CheckIcon from "phosphor-svelte/lib/CheckIcon";
  import SquareIcon from "phosphor-svelte/lib/SquareIcon";
  import type { Snippet } from "svelte";

  type Props = {
    title: string;
    subtext?: string;
    selected?: boolean;
    icon?: Snippet;
    onclick?: (ev: MouseEvent) => void;
  };

  const { title, subtext = "", selected = false, icon, onclick }: Props = $props();
</script>

<!-- svelte-ignore a11y_interactive_supports_focus -->
<div
  class="card"
  class:selected
  role="button"
  tabindex="0"
  {onclick}
  onkeydown={(e) => {
    if (e.key === "Enter" || e.key === " ") onclick?.(e as unknown as MouseEvent);
  }}
>
  <div class="accent-bar"></div>

  <div class="content">
    <span class="title">{title}</span>
    {#if subtext}
      <span class="subtext">{subtext}</span>
    {/if}
  </div>

  <div class="icons">
    <span class="check-icon" class:visible={selected}>
      <CheckIcon size={24} weight="bold" />
    </span>
    <span class="type-icon">
      {#if icon}
        {@render icon()}
      {:else}
        <SquareIcon size={24} />
      {/if}
    </span>
  </div>
</div>

<style>
  .card {
    position: relative;
    display: flex;
    flex-direction: row;
    align-items: center;
    gap: var(--space-5);
    padding: var(--space-4) var(--space-6);
    padding-left: calc(var(--space-6) + 4px + var(--space-4));

    border-radius: var(--radius-md);
    border: 0.5px solid var(--border-subtle);
    background-color: var(--color-bg-2);
    color: var(--color-text-hi-con);

    cursor: pointer;
    user-select: none;
    overflow: hidden;

    transition:
      background-color 120ms ease,
      color 120ms ease,
      border-color 120ms ease;
  }

  .card:hover:not(.selected) {
    background-color: var(--color-bg-3);
  }

  .card:focus-visible {
    outline: 2px solid var(--color-accent);
    outline-offset: 2px;
  }

  /* Selected: white-on-dark */
  .card.selected {
    background-color: var(--color-flip-bg-2);
    color: var(--color-flip-text-hi-con);
  }

  /* Left accent band */
  .accent-bar {
    position: absolute;
    left: 0;
    top: 0;
    bottom: 0;
    width: 6px;
    background-color: var(--color-accent);
  }

  .card.selected .accent-bar {
    background-color: var(--color-accent);
  }

  /* Text area */
  .content {
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: var(--space-2);
    min-width: 0;
  }

  .title {
    font-size: var(--font-size-sm);
    font-weight: var(--font-weight-bold);
    line-height: var(--line-height-tight);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .subtext {
    font-size: var(--font-size-xs);
    font-weight: var(--font-weight-normal);
    line-height: var(--line-height-normal);
    color: var(--color-text-md-con);
  }

  .card.selected .subtext {
    color: var(--color-flip-text-md-con);
  }

  /* Right icons */
  .icons {
    flex-shrink: 0;
    display: flex;
    flex-direction: row;
    align-items: center;
    gap: var(--space-3);
  }

  .check-icon {
    display: inline-flex;
    align-items: center;
    opacity: 0;
    transition: opacity 100ms ease;
  }

  .check-icon.visible {
    opacity: 1;
  }

  .type-icon {
    display: inline-flex;
    align-items: center;
    color: var(--color-text-md-con);
  }

  .card.selected .type-icon {
    color: var(--color-flip-text-md-con);
  }
</style>
