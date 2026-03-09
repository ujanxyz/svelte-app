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

<div class="btn-group">
  {#each buttons as btn}
    <button class:selected={btn.code === value} onclick={() => select(btn)}>
      {btn.label}
    </button>
  {/each}
</div>

<style>
.btn-group {
  box-sizing: border-box;
  display: inline-flex;
  border: 1px solid var(--color-border-default);
  border-radius: 6px;
  overflow: hidden;
}
button {
  border: none;
  padding: 4px 10px;
  cursor: pointer;
  background-color: var(--color-bg-4);
  color: var(--color-text-hi-con);
}

button:not(:last-child) {
  border-right: 1px solid var(--color-border-default);
}

button.selected {
  background: #2b7cff;
  color: white;
}
</style>
