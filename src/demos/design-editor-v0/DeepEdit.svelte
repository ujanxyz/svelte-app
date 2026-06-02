<script lang="ts">
import type { base } from "@/types/base";

import type { IDimension } from "./types";

type Props = {
  shapeType: string;
  coords: base.XYPosition[];
  viewDimension: IDimension;
  zoomLevel: base.ZoomLevel;
  onclose?: () => void;
  oncoordschange?: (coords: base.XYPosition[]) => void;
};

const {
  shapeType,
  coords,
  viewDimension,
  zoomLevel,
  onclose,
  oncoordschange,
}: Props = $props();

let localCoords = $state<base.XYPosition[]>([]);
let interaction = $state.raw<{
  previewEl: SVGSVGElement | null;
  drag: { index: number; pointerId: number } | null;
}>({
  previewEl: null,
  drag: null,
});

const previewWidth = $derived(Math.max(260, Math.min(620, Math.round(viewDimension.width * 0.48))));
const previewHeight = $derived(Math.max(200, Math.min(420, Math.round(viewDimension.height * 0.44))));

$effect(() => {
  localCoords = coords.map((coord) => ({ x: coord.x, y: coord.y }));
});

function clampCoord(value: number): number {
  return Math.max(-100, Math.min(100, value));
}

function mapCoord(value: number, size: number, direction: "toPreview" | "fromPreview"): number {
  return direction === "toPreview"
    ? ((value + 100) / 200) * size
    : ((value / size) * 200) - 100;
}

function toPreview(coord: base.XYPosition): base.XYPosition {
  return {
    x: mapCoord(coord.x, previewWidth, "toPreview"),
    y: mapCoord(coord.y, previewHeight, "toPreview"),
  };
}

function emitCoords(): void {
  oncoordschange?.(localCoords.map((coord) => ({ x: coord.x, y: coord.y })));
}

function updatePoint(index: number, axis: "x" | "y", raw: string): void {
  const parsed = Number(raw);
  if (Number.isNaN(parsed)) return;

  localCoords = localCoords.map((coord, i) => {
    if (i !== index) return coord;
    return axis === "x"
      ? { x: clampCoord(parsed), y: coord.y }
      : { x: coord.x, y: clampCoord(parsed) };
  });

  emitCoords();
}

function updatePointFromPreview(index: number, previewX: number, previewY: number): void {
  localCoords = localCoords.map((coord, i) => {
    if (i !== index) return coord;
    return {
      x: clampCoord(mapCoord(previewX, previewWidth, "fromPreview")),
      y: clampCoord(mapCoord(previewY, previewHeight, "fromPreview")),
    };
  });
  emitCoords();
}

/**
 * Maps a pointer event from the preview SVG into local preview coordinates.
 * Returned values are clamped to the preview bounds.
 */
function pointFromPointer(ev: PointerEvent): { x: number; y: number } | null {
  if (!interaction.previewEl) return null;
  const rect = interaction.previewEl.getBoundingClientRect();
  const x = Math.max(0, Math.min(previewWidth, ((ev.clientX - rect.left) / rect.width) * previewWidth));
  const y = Math.max(0, Math.min(previewHeight, ((ev.clientY - rect.top) / rect.height) * previewHeight));
  return { x, y };
}

function beginNodeDrag(index: number, ev: PointerEvent): void {
  if (ev.button !== 0) return;
  ev.preventDefault();

  interaction = {
    ...interaction,
    drag: { index, pointerId: ev.pointerId },
  };

  if (interaction.previewEl) {
    interaction.previewEl.setPointerCapture(ev.pointerId);
  }

  const p = pointFromPointer(ev);
  if (!p) return;
  updatePointFromPreview(index, p.x, p.y);
}

function onPreviewPointerMove(ev: PointerEvent): void {
  if (!interaction.drag || ev.pointerId !== interaction.drag.pointerId) return;
  const p = pointFromPointer(ev);
  if (!p) return;
  updatePointFromPreview(interaction.drag.index, p.x, p.y);
}

function endNodeDrag(ev: PointerEvent): void {
  if (!interaction.drag || ev.pointerId !== interaction.drag.pointerId) return;

  if (interaction.previewEl && interaction.previewEl.hasPointerCapture(ev.pointerId)) {
    interaction.previewEl.releasePointerCapture(ev.pointerId);
  }

  interaction = {
    ...interaction,
    drag: null,
  };
}

function addPoint(): void {
  if (localCoords.length < 2) {
    localCoords = [...localCoords, { x: 0, y: 0 }];
    emitCoords();
    return;
  }

  const last = localCoords[localCoords.length - 1];
  const first = localCoords[0];
  localCoords = [
    ...localCoords,
    {
      x: clampCoord((last.x + first.x) / 2),
      y: clampCoord((last.y + first.y) / 2),
    },
  ];
  emitCoords();
}

function removePoint(index: number): void {
  if (localCoords.length <= 3) return;
  localCoords = localCoords.filter((_, i) => i !== index);
  emitCoords();
}

function close(): void {
  onclose?.();
}
</script>

{#if shapeType === "polygon"}
  <div class="deep-edit-overlay">
    <button type="button" class="overlay-backdrop" aria-label="Close deep edit" onclick={close}></button>
    <div class="deep-edit-panel" role="dialog" aria-modal="true" aria-label="Polygon deep edit">
      <header class="panel-header">
        <div>
          <p class="eyebrow">Deep Edit</p>
          <h3>Polygon Points</h3>
          <p class="meta">View: {Math.round(viewDimension.width)} x {Math.round(viewDimension.height)} | Zoom: {zoomLevel.zoom.toFixed(2)}x</p>
        </div>
        <button type="button" class="close-btn" onclick={close}>Close</button>
      </header>

      <div class="preview-wrap">
        <svg
          class="preview"
          bind:this={interaction.previewEl}
          role="img"
          aria-label="Polygon points preview"
          width={previewWidth}
          height={previewHeight}
          viewBox={`0 0 ${previewWidth} ${previewHeight}`}
          onpointermove={onPreviewPointerMove}
          onpointerup={endNodeDrag}
          onpointercancel={endNodeDrag}
        >
          <rect x="0" y="0" width={previewWidth} height={previewHeight} rx="10" class="preview-bg" />

          <line x1={previewWidth / 2} y1="0" x2={previewWidth / 2} y2={previewHeight} class="axis" />
          <line x1="0" y1={previewHeight / 2} x2={previewWidth} y2={previewHeight / 2} class="axis" />

          {#if localCoords.length >= 3}
            <polygon
              points={localCoords.map((coord) => {
                const p = toPreview(coord);
                return `${p.x},${p.y}`;
              }).join(" ")}
              class="poly"
            />
          {/if}

          {#each localCoords as coord, i}
            {@const p = toPreview(coord)}
            <circle
              cx={p.x}
              cy={p.y}
              r="6"
              class="node"
              class:dragging={interaction.drag?.index === i}
              role="button"
              tabindex="-1"
              aria-label={`Move point ${i + 1}`}
              onpointerdown={(ev) => beginNodeDrag(i, ev)}
            />
            <text x={p.x + 7} y={p.y - 7} class="node-label">{i + 1}</text>
          {/each}
        </svg>
      </div>

      <div class="point-list">
        <div class="point-list-header">
          <strong>Points ({localCoords.length})</strong>
          <button type="button" class="add-btn" onclick={addPoint}>Add Point</button>
        </div>

        {#each localCoords as coord, i}
          <div class="point-row">
            <span class="index">#{i + 1}</span>
            <label>
              x
              <input type="number" min={-100} max={100} step="1" value={coord.x} oninput={(e) => updatePoint(i, "x", (e.currentTarget as HTMLInputElement).value)} />
            </label>
            <label>
              y
              <input type="number" min={-100} max={100} step="1" value={coord.y} oninput={(e) => updatePoint(i, "y", (e.currentTarget as HTMLInputElement).value)} />
            </label>
            <button type="button" class="remove-btn" onclick={() => removePoint(i)} disabled={localCoords.length <= 3}>Remove</button>
          </div>
        {/each}
      </div>
    </div>
  </div>
{/if}

<style>
.deep-edit-overlay {
  position: absolute;
  inset: 0;
  z-index: 7;
  display: grid;
  place-items: center;
  background: rgba(8, 15, 28, 0.38);
  pointer-events: auto;
}

.overlay-backdrop {
  position: absolute;
  inset: 0;
  border: 0;
  margin: 0;
  padding: 0;
  background: transparent;
  cursor: default;
}

.deep-edit-panel {
  position: relative;
  z-index: 1;
  width: min(900px, calc(100% - 24px));
  max-height: calc(100% - 24px);
  overflow: auto;
  border-radius: 14px;
  border: 1px solid rgba(100, 116, 139, 0.38);
  background: rgba(255, 255, 255, 0.96);
  box-shadow: 0 24px 48px rgba(15, 23, 42, 0.24);
  padding: 16px;
  display: grid;
  gap: 14px;
}

.panel-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 10px;
}

.eyebrow {
  margin: 0;
  font-size: 11px;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: #475569;
}

h3 {
  margin: 2px 0;
  font-size: 20px;
  line-height: 1.15;
}

.meta {
  margin: 0;
  font-size: 13px;
  color: #64748b;
}

.close-btn,
.add-btn,
.remove-btn {
  border: 1px solid rgba(100, 116, 139, 0.35);
  background: #f8fafc;
  color: #0f172a;
  border-radius: 8px;
  padding: 6px 10px;
  font: inherit;
  cursor: pointer;
}

.close-btn:hover,
.add-btn:hover,
.remove-btn:hover {
  background: #eef2ff;
}

.remove-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.preview-wrap {
  display: grid;
  place-items: center;
}

.preview {
  display: block;
}

.preview-bg {
  fill: #f8fafc;
  stroke: rgba(100, 116, 139, 0.35);
  stroke-width: 1;
}

.axis {
  stroke: rgba(100, 116, 139, 0.35);
  stroke-width: 1;
  stroke-dasharray: 3 3;
}

.poly {
  fill: rgba(59, 130, 246, 0.18);
  stroke: #2563eb;
  stroke-width: 2;
}

.node {
  fill: #0f172a;
  cursor: grab;
}

.node.dragging {
  fill: #2563eb;
  cursor: grabbing;
}

.node-label {
  font-size: 11px;
  fill: #0f172a;
}

.point-list {
  display: grid;
  gap: 8px;
}

.point-list-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.point-row {
  display: grid;
  grid-template-columns: auto 1fr 1fr auto;
  gap: 8px;
  align-items: center;
  padding: 8px;
  border-radius: 8px;
  background: #f8fafc;
}

.index {
  font-size: 12px;
  color: #334155;
  min-width: 28px;
}

label {
  display: grid;
  gap: 4px;
  font-size: 12px;
  color: #334155;
}

input {
  border: 1px solid rgba(100, 116, 139, 0.4);
  border-radius: 6px;
  padding: 6px 8px;
  font: inherit;
}
</style>
