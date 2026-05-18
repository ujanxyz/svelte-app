<script lang="ts">
import { computeLetterbox } from "@/utils/canvasUtils";

interface PickFileItem {
  id: string;
  filename: string;
  subtitle: string;
  assetUri: string;
  thumbnailBitmap: ImageBitmap;
}

interface Props {
  item: PickFileItem;
  selected: boolean;
  onselect: (id: string) => void;
}

const { item, selected, onselect }: Props = $props();

let canvas: HTMLCanvasElement;

$effect(() => {
  if (!canvas || !item.thumbnailBitmap) return;
  const ctx = canvas.getContext("2d");
  if (!ctx) return;
  ctx.fillStyle = "#888";
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  const { dx, dy, dw, dh } = computeLetterbox(
    canvas.width,
    canvas.height,
    item.thumbnailBitmap.width,
    item.thumbnailBitmap.height
  );
  ctx.drawImage(item.thumbnailBitmap, dx, dy, dw, dh);
});
</script>

<button class="row" class:selected={selected} onclick={() => onselect(item.id)}>
  <canvas class="thumb" bind:this={canvas} width="96" height="56" aria-label={item.filename}></canvas>
  <div class="meta">
    <div class="name" title={item.filename}>{item.filename}</div>
    <div class="line">{item.subtitle}</div>
    <div class="line" title={item.assetUri}>{item.assetUri}</div>
  </div>
</button>

<style>
.row {
  --row-height: 4.25rem;
  box-sizing: border-box;
  height: var(--row-height);
  width: 100%;
  border: 0;
  border-radius: var(--radius-md);
  background: var(--color-bg-2);
  color: inherit;

  display: flex;
  flex-direction: row;
  align-items: center;
  text-align: left;
  cursor: pointer;
  overflow: hidden;
}

.row:hover {
  background: var(--color-bg-3);
}

.row.selected {
  background: var(--color-flip-bg-3);
  color: var(--color-flip-text-hi-con);
}

.thumb {
  box-sizing: border-box;
  height: var(--row-height);
  width: calc(1.5 * var(--row-height));
}

.meta {
  padding: 0 var(--space-3);
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: var(--space-1);
}

.name {
  font-size: 0.76rem;
  font-weight: 600;
}

.line {
  font-size: 0.66rem;
  color: var(--color-text-md-con);
}

.name, .line {
  color: inherit;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.row.selected .line {
  color: var(--color-flip-text-md-con);
}

</style>
