<script lang="ts">
interface Props {
  dtype: string;
  label: string;
  desc: string;
  onSelect: (dtype: string) => void;
  selected?: boolean;
}

const {
  dtype,
  label,
  desc,
  onSelect,
  selected = false,
}: Props = $props();

function handleClick(): void {
  onSelect(dtype);
}
</script>

<button
  type="button"
  class="card"
  class:selected
  data-uj-io-dtype={dtype}
  onclick={handleClick}
>
  <div class="header-row">
    <strong class="title">{label}</strong>
    <span class="header-io" aria-hidden="true">I/O</span>
  </div>

  <p class="description">{desc}</p>
</button>

<style>
.card {
  width: 100%;
  height: 8.75rem;

  min-height: 8rem;
  box-sizing: border-box;
  display: grid;
  grid-template-rows: auto minmax(0, 1fr);
  gap: var(--space-3);
  padding: var(--space-3) var(--space-4);
  border: 1px solid var(--border-subtle);
  border-radius: var(--radius-md);
  background: var(--surface-elevated);
  color: var(--text-primary);
  text-align: left;
  cursor: pointer;
  overflow: hidden;
}

.card:hover {
  border-color: var(--color-accent);
  box-shadow: 0 0 0 1px var(--color-accent);
}

.card:focus-visible {
  outline: 0;
  border-color: var(--color-accent);
  box-shadow: 0 0 0 2px var(--color-accent);
  background: var(--color-flip-bg-2);
  color: var(--color-flip-text-hi-con);
}

.card.selected {
  background: var(--color-flip-bg-2);
  color: var(--color-flip-text-hi-con);
  border-color: var(--color-flip-border-default);
}

.header-row {
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto;
  gap: var(--space-3);
  align-items: start;
}

.title {
  margin: 0;
  min-width: 0;
  font-size: var(--font-size-lg);
  font-weight: var(--font-weight-bold, 700);
  line-height: 1.15;
  color: inherit;
  overflow-wrap: anywhere;
}

.header-io {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-style: italic;
  font-size: var(--font-size-xs);
  letter-spacing: 0.02em;
  color: var(--text-secondary);
}

.card.selected .header-io {
  color: var(--color-flip-text-md-con);
}

.description {
  margin: 0;
  min-width: 0;
  font-size: var(--font-size-sm);
  line-height: 1.2;
  color: var(--text-secondary);
  display: -webkit-box;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 4;
  line-clamp: 4;
  overflow: hidden;
  text-overflow: ellipsis;
}

.card.selected .description {
  color: var(--color-flip-text-md-con);
}
</style>
