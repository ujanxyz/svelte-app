<script lang="ts">
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
  ctx.fillStyle = "#111";
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.drawImage(item.thumbnailBitmap, 0, 0, canvas.width, canvas.height);
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
  width: 100%;
  border: 1px solid rgba(255 255 255 / 0.14);
  border-radius: 8px;
  background: rgba(255 255 255 / 0.04);
  color: inherit;
  padding: 6px;
  display: grid;
  grid-template-columns: 96px 1fr;
  gap: 8px;
  text-align: left;
  cursor: pointer;
}

.row:hover {
  background: rgba(255 255 255 / 0.09);
}

.row.selected {
  border-color: rgba(104 176 255 / 0.9);
  background: rgba(38 119 190 / 0.22);
}

.thumb {
  border-radius: 6px;
  border: 1px solid rgba(255 255 255 / 0.15);
  width: 96px;
  height: 56px;
}

.meta {
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 3px;
}

.name {
  font-size: 0.76rem;
  font-weight: 600;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.line {
  font-size: 0.66rem;
  color: rgba(255 255 255 / 0.74);
}
</style>
