<script lang="ts">
import type { MediaItem } from "./mediaManagerTypes";

interface Props {
  item: MediaItem;
  checked?: boolean;
  oncheck: (id: string, checked: boolean) => void;
  ondelete: (id: string) => void;
  onmenu: (id: string) => void;
}

const {
  item,
  checked = false,
  oncheck,
  ondelete,
  onmenu,
}: Props = $props();

function handleCheckboxToggle(ev: Event): void {
  const input = ev.currentTarget as HTMLInputElement;
  oncheck(item.id, input.checked);
}

function stop(ev: Event): void {
  ev.stopPropagation();
}
</script>

<div class="row" class:selected={checked} role="button" tabindex="0" onclick={() => oncheck(item.id, !checked)} onkeydown={(ev) => ev.key === "Enter" && oncheck(item.id, !checked)}>
  <div class="cell cell-preview">
    <input type="checkbox" checked={checked} onchange={handleCheckboxToggle} onclick={stop} />
    <img src={item.thumbnailUrl} alt={item.displayName} loading="lazy" />
  </div>

  <div class="cell cell-name">
    <div class="name-main">{item.displayName}</div>
    <div class="name-sub">{item.filename}</div>
  </div>

  <div class="cell">{item.width} x {item.height}</div>
  <div class="cell">{item.sizeLabel}</div>
  <div class="cell"><span class="pill kind-{item.kind}">{item.kind}</span></div>
  <div class="cell">{item.addedAgoLabel}</div>
  <div class="cell actions">
    <button class="icon danger" onclick={(ev) => { stop(ev); ondelete(item.id); }} title="Delete">DEL</button>
    <button class="icon" onclick={(ev) => { stop(ev); onmenu(item.id); }} title="More">...</button>
  </div>
</div>

<style>
.row {
  display: grid;
  grid-template-columns: minmax(190px, 2.2fr) minmax(220px, 2.8fr) 1.2fr 0.95fr 0.75fr 1.1fr 0.9fr;
  align-items: center;
  border-bottom: 1px solid var(--border-subtle);
  color: var(--text-primary);
  min-height: 74px;
  cursor: pointer;
}

.row:hover {
  background-color: var(--surface-elevated);
}

.row.selected {
  background-color: var(--color-flip-bg-1);
  color: var(--color-flip-text-hi-con);
  border-bottom-color: var(--color-flip-border-subtle);
}

.row.selected:hover {
  background-color: var(--color-flip-bg-2);
}

.row.selected .name-sub {
  color: var(--color-flip-text-md-con);
}

.cell {
  padding: 0.7rem 0.5rem;
  font-family: "Public Sans", "Segoe UI", sans-serif;
  font-size: 0.88rem;
  color: inherit;
}

.cell-preview {
  display: flex;
  align-items: center;
  gap: 0.65rem;
  padding-left: 0.6rem;
}

.cell-preview img {
  width: 96px;
  height: 54px;
  object-fit: cover;
  border-radius: 8px;
  border: 1px solid var(--border-subtle);
}

.name-main {
  font-size: 1.02rem;
  font-weight: 620;
  letter-spacing: 0.01em;
  color: inherit;
}

.name-sub {
  font-size: 0.82rem;
  color: var(--text-secondary);
  margin-top: 0.2rem;
}

.pill {
  border: 1px solid var(--border-subtle);
  border-radius: 999px;
  font-size: 0.75rem;
  padding: 0.16rem 0.52rem;
  font-weight: 700;
  background-color: var(--surface-elevated);
  color: var(--text-secondary);
}

.kind-JPG {
  background-color: color-mix(in srgb, var(--interactive-primary-bg) 22%, var(--surface-panel));
  border-color: color-mix(in srgb, var(--interactive-primary-bg) 42%, var(--border-default));
  color: var(--interactive-primary-text);
}

.kind-PNG {
  background-color: color-mix(in srgb, var(--color-success) 18%, var(--surface-panel));
  border-color: color-mix(in srgb, var(--color-success) 38%, var(--border-default));
  color: color-mix(in srgb, var(--color-success) 82%, var(--text-primary));
}

.kind-WEBP {
  background-color: color-mix(in srgb, var(--color-accent) 16%, var(--surface-panel));
  border-color: color-mix(in srgb, var(--color-accent) 36%, var(--border-default));
  color: color-mix(in srgb, var(--color-accent) 78%, var(--text-primary));
}

.kind-MP4 {
  background-color: color-mix(in srgb, var(--color-warning) 24%, var(--surface-panel));
  border-color: color-mix(in srgb, var(--color-warning) 42%, var(--border-default));
  color: color-mix(in srgb, var(--color-warning) 86%, var(--text-primary));
}

.actions {
  display: flex;
  gap: 0.5rem;
  align-items: center;
}

.icon {
  background: transparent;
  border: 1px solid var(--border-subtle);
  color: var(--text-secondary);
  border-radius: var(--radius-lg);
  padding: 0.2rem 0.48rem;
  cursor: pointer;
}

.icon:hover {
  background-color: var(--surface-elevated);
}

.icon.danger {
  color: #ff7f7f;
}
</style>
