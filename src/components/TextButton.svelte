<script lang="ts">
type Props = {
  text: string;
  onclick: (ev: MouseEvent) => void;
};
const { text, onclick }: Props = $props();
</script>

<button {onclick} class="btn">
  <span class="txt">{text}</span>
</button>

<style>
.btn {
  padding: var(--space-3) var(--space-4);
  border: 1px solid var(--border-subtle);
  border-radius: var(--radius-md);
  background-color: var(--color-bg-3);
  color: var(--color-text-hi-con);
  display: inline-flex;
  align-items: center;
  cursor: pointer;
}

.btn:hover {
  background-color: var(--color-bg-4);
}

.btn:focus-within {
  outline: 2px solid var(--color-accent);
  outline-offset: 2px;
}

.txt {
  font-size: var(--font-size-md);
  font-weight: var(--font-weight-medium);
}
</style>
