<script lang="ts">
type Props = {
  text: string;
  onclick: () => void;
};
const { text, onclick }: Props = $props();
</script>

<div>
  <button {onclick} class="btn">
    <span class="txt-md-strong">{text}</span>
  </button>
</div>

<style>
.btn {
  padding: var(--space-2) var(--space-4);
  border: 1px solid var(--border-subtle);
  border-radius: var(--radius-md);

  display: inline-flex;
  align-items: center;
  cursor: pointer;

  font-weight: var(--font-weight-medium);
  background-color: var(--color-bg-3);
  color: var(--color-text-hi-con);
}

.btn:hover {
  background-color: var(--color-bg-4);
}

.btn:focus-within {
  outline: 2px solid var(--color-accent);
  outline-offset: 2px;
}
</style>
