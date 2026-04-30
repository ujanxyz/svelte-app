<script lang="ts">
  type Props = {
    oncancel: () => void;
    onconfirm: () => void;
    confirmLabel?: string;
    confirmDisabled?: boolean;
  };

  const {
    oncancel,
    onconfirm,
    confirmLabel = "OK",
    confirmDisabled = false,
  }: Props = $props();
</script>

<div class="action-bar">
  <button class="btn btn-cancel" onclick={oncancel}>CANCEL</button>
  <button
    class="btn btn-confirm"
    onclick={onconfirm}
    disabled={confirmDisabled}
  >
    {confirmLabel}
  </button>
</div>

<style>
  .action-bar {
    display: flex;
    align-items: center;
    justify-content: flex-end;
    gap: var(--space-4);
    padding: var(--space-5) var(--space-6);
    border-top: 1px solid var(--border-subtle);
    flex-shrink: 0;
  }

  .btn {
    padding: var(--space-3) var(--space-6);
    border-radius: var(--radius-md);
    font-family: var(--font-family-sans);
    font-size: var(--font-size-sm);
    font-weight: var(--font-weight-bold);
    letter-spacing: var(--letter-spacing-loose);
    cursor: pointer;
    transition:
      background-color 120ms ease,
      border-color 120ms ease,
      opacity 120ms ease;
  }

  .btn:focus-visible {
    outline: 2px solid var(--color-accent);
    outline-offset: 2px;
  }

  .btn-cancel {
    background: transparent;
    border: 1px solid var(--border-default);
    color: var(--text-primary);
  }

  .btn-cancel:hover {
    background-color: var(--surface-elevated);
  }

  .btn-confirm {
    background-color: var(--interactive-selected-bg);
    border: 1px solid transparent;
    color: var(--interactive-selected-text);
  }

  .btn-confirm:hover:not(:disabled) {
    background-color: var(--interactive-primary-bg-hover);
  }

  .btn-confirm:disabled {
    opacity: 0.4;
    cursor: not-allowed;
  }
</style>
