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

let canvas: HTMLCanvasElement;

$effect(() => {
  if (canvas && item.thumbnailBitmap) {
    const ctx = canvas.getContext("2d");
    if (ctx) {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(item.thumbnailBitmap, 0, 0, canvas.width, canvas.height);
    }
  }
});

function handleCheckboxToggle(ev: Event): void {
  const input = ev.currentTarget as HTMLInputElement;
  oncheck(item.id, input.checked);
}

function stop(ev: Event): void {
  ev.stopPropagation();
}
</script>

<div class="card" class:selected={checked} role="button" tabindex="0" onclick={() => oncheck(item.id, !checked)} onkeydown={(ev) => ev.key === "Enter" && oncheck(item.id, !checked)}>
  <div class="card-top">
    <input type="checkbox" checked={checked} onchange={handleCheckboxToggle} onclick={stop} />
    <button class="icon danger" onclick={(ev) => { stop(ev); ondelete(item.id); }} title="Delete">DEL</button>
  </div>

  <canvas class="preview-canvas" bind:this={canvas} width="320" height="180" aria-label={item.displayName}></canvas>

  <div class="meta">
    <div class="title">{item.displayName}</div>
    <div class="dim">{item.width} x {item.height} • {item.sizeLabel}</div>
    <div class="row2">
      <span class="pill kind-{item.kind}">{item.kind}</span>
      <button class="icon" onclick={(ev) => { stop(ev); onmenu(item.id); }} title="More">...</button>
    </div>
  </div>
</div>

<style>
.card {
  border: 1px solid var(--border-subtle);
  border-radius: var(--radius-xl);
  background:
    radial-gradient(circle at 20% -10%, color-mix(in srgb, var(--color-bg-4) 45%, transparent), transparent 40%),
    var(--surface-panel);
  overflow: hidden;
  padding: 0.65rem;
  color: var(--text-primary);
  cursor: pointer;
}

.card:hover {
  border-color: var(--border-default);
  background: var(--surface-elevated);
  transform: translateY(-1px);
}

.card.selected {
  background: var(--color-flip-bg-1);
  border-color: var(--color-flip-border-default);
  color: var(--color-flip-text-hi-con);
}

.card.selected:hover {
  background: var(--color-flip-bg-2);
  border-color: var(--color-flip-border-strong);
  transform: translateY(-1px);
}

.card.selected .dim {
  color: var(--color-flip-text-md-con);
}

.card-top {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.45rem;
}

.preview-canvas {
  width: 100%;
  aspect-ratio: 16 / 9;
  border-radius: 8px;
  border: 1px solid var(--border-subtle);
}

.meta {
  margin-top: 0.55rem;
}

.title {
  font-size: 0.96rem;
  font-weight: 620;
  color: inherit;
  margin-bottom: 0.2rem;
}

.dim {
  font-size: 0.79rem;
  color: var(--text-secondary);
}

.row2 {
  margin-top: 0.45rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
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
