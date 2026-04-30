<script lang="ts">
interface ButtonItem {
  label: string;
  code: string;
}

interface Props {
  buttons: ButtonItem[];
  value?: string | null;
  onselect?: (code: string) => void;
}

let {
  buttons = [],
  value = $bindable<string | null>(),
  onselect,
}: Props = $props();

// default selection
$effect(() => {
  if (buttons.length > 0 && value == null) {
    value = buttons[0].code;
  }
});

function select(btn: ButtonItem) {
  if (value === btn.code) return;
  value = btn.code;
  onselect?.(btn.code);
}
</script>

<div class="shell">
  {#each buttons as btn}
    <button class:selected={btn.code === value} onclick={() => select(btn)}>
      {btn.label}
    </button>
  {/each}
</div>

<style>
.shell {
  --border-style: 1px solid var(--border-default);
  box-sizing: border-box;
  display: inline-flex;
  border: var(--border-style);
  border-radius: var(--radius-lg);
  overflow: hidden;
}
.shell:focus-within {
  outline: 2px solid var(--color-accent);
  outline-offset: 2px;
}

button {
  border: none;
  padding: var(--space-2) var(--space-4);
  cursor: pointer;
  font-weight: var(--font-weight-medium);
  background-color: var(--color-bg-3);
  color: var(--color-text-hi-con);
}

button:not(:last-child) {
  border-right: var(--border-style);
}

button.selected {
  background-color: var(--color-flip-bg-4);
  color: var(--color-flip-text-hi-con);
}
</style>
