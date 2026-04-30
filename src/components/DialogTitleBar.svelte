<script lang="ts">
  import XIcon from "phosphor-svelte/lib/XIcon";

  type Props = {
    title: string;
    onclose: () => void;
  };

  const { title, onclose }: Props = $props();
</script>

<div class="shell" data-debug-name="DialogTitleBar.root">
  <span class="title">{title}</span>
  <button class="close-btn" onclick={onclose} aria-label="Close dialog">
    <XIcon size={18} weight="bold" />
  </button>
</div>

<style>
  .shell {
    padding: var(--space-5) var(--space-6);
    border-bottom: 1px solid var(--border-subtle);
    min-width: 0;
    background-color: var(--color-bg-1);
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: var(--space-4);
    flex-shrink: 0;
  }

  .title {
    font-family: var(--font-family-sans);
    font-size: var(--font-size-lg);
    font-weight: var(--font-weight-bold);
    color: var(--text-primary);
    line-height: var(--line-height-tight);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    min-width: 0;
  }

  .close-btn {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 30px;
    height: 30px;
    border-radius: 50%;
    border: none;
    background: transparent;
    color: var(--text-secondary);
    cursor: pointer;
    flex-shrink: 0;
    transition:
      background-color 120ms ease,
      color 120ms ease;
  }

  .close-btn:hover {
    background-color: var(--surface-elevated);
    color: var(--text-primary);
  }

  .close-btn:focus-visible {
    outline: 2px solid var(--color-accent);
    outline-offset: 2px;
  }
</style>
