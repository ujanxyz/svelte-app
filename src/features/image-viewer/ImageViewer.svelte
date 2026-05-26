<script lang="ts">
import { getContext, onMount } from "svelte";

import FadingPanel from "@/components/FadingPanel.svelte";
import LoadingSpinner from "@/components/LoadingSpinner.svelte";
import { useOverlayInstance } from "@/modules/overlay2";
import type { StoredAssetMeta } from "@/types/worker-message-types";
import { getAppIcon } from "@/utils/appIcons";
import { computeFitScale } from "@/utils/canvasUtils";
import { IoWorkerApi } from "@/webworkerclient/IoWorkerApi";

const ZOOM_STEP = 1.2;
const ZOOM_MIN = 0.1;
const ZOOM_MAX = 5;
const PAN_STEP = 40;
const INITIAL_MAX_W = 1200;
const INITIAL_MAX_H = 800;
const ARTIFICIAL_DELAY_MS = 0;

const io = getContext(IoWorkerApi.CONTEXT_KEY) as IoWorkerApi;
const overlay = useOverlayInstance<{ assetUri: string }, void>();
const IcoSeparator = getAppIcon("dot-outline");
const assetUri = overlay.payload?.assetUri;

// Reactive state: media data
let bitmap = $state<ImageBitmap | null>(null);
let displayName = $state<string>("Loading media...");
let mediaWidth = $state<number>(1280);
let mediaHeight = $state<number>(720);
let byteSize = $state<number>(0);
let format = $state<string>("PNG");
let loading = $state<boolean>(true);
let loadError = $state<string | null>(null);

// Reactive state: canvas and UI
let zoomLevel = $state<number>(0); // 0 = not yet initialized
let pan = $state.raw<{ x: number; y: number }>({ x: 0, y: 0 });
let canvasW = $state<number>(0);
let canvasH = $state<number>(0);
let isDragging = $state<boolean>(false);

// DOM refs (assigned by bind:this, not reactive state)
let windowEl: HTMLDivElement;
let canvas: HTMLCanvasElement;

// Non-reactive helpers
let checkerImage: HTMLImageElement | null = null;
let checkerPattern: CanvasPattern | null = null;
let dragStartX: number = 0;
let dragStartY: number = 0;
let dragStartPanX: number = 0;
let dragStartPanY: number = 0;

const fitScale = $derived(
  canvasW > 0 && canvasH > 0 && mediaWidth > 0 && mediaHeight > 0
    ? computeFitScale(canvasW, canvasH, mediaWidth, mediaHeight)
    : 1,
);

const isZoomedIn = $derived(
  mediaWidth * zoomLevel > canvasW + 0.5 || mediaHeight * zoomLevel > canvasH + 0.5,
);

const initW = $derived(
  Math.min(Math.max(mediaWidth > 0 ? mediaWidth : 800, 400), INITIAL_MAX_W),
);
const initH = $derived(
  Math.min(Math.max(mediaHeight > 0 ? mediaHeight : 600, 300), INITIAL_MAX_H),
);

function wait(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function inferFormat(filename: string, mimeType: string): string {
  const dot = filename.lastIndexOf(".");
  if (dot > -1 && dot < filename.length - 1) {
    return filename.slice(dot + 1).toUpperCase();
  }
  const slash = mimeType.indexOf("/");
  return slash > -1 ? mimeType.slice(slash + 1).toUpperCase() : "UNKNOWN";
}

function isStoredMediaMeta(meta: StoredAssetMeta): meta is Extract<StoredAssetMeta, { mimeType: string }> {
  return "mimeType" in meta && "filename" in meta;
}

function getDisplayName(meta: StoredAssetMeta): string {
  if (isStoredMediaMeta(meta)) {
    return meta.filename;
  }
  return `${meta.stage} artifact ${meta.id}`;
}

function getDisplayFormat(meta: StoredAssetMeta): string {
  if (isStoredMediaMeta(meta)) {
    return inferFormat(meta.filename, meta.mimeType);
  }
  return `ARTIFACT:${meta.stage.toUpperCase()}`;
}

async function loadMediaByPayloadId(): Promise<void> {
  if (!assetUri) {
    loadError = "Missing asset URI in overlay payload.";
    loading = false;
    return;
  }

  loading = true;
  loadError = null;
  bitmap = null;

  try {
    const [response] = await Promise.all([
      io.getMediaData({ id: assetUri }),
      wait(ARTIFICIAL_DELAY_MS),
    ]);
    bitmap = response.bitmap;
    displayName = getDisplayName(response.meta);
    byteSize = response.meta.byteSize;
    format = getDisplayFormat(response.meta);

    const dim = response.meta.dimension;
    if (Array.isArray(dim) && dim.length === 2) {
      mediaWidth = dim[0];
      mediaHeight = dim[1];
    } else {
      mediaWidth = response.bitmap.width;
      mediaHeight = response.bitmap.height;
    }

    zoomLevel = 0;
    pan.x = 0;
    pan.y = 0;
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    loadError = `Failed to load media: ${message}`;
  } finally {
    loading = false;
  }
}

function drawErrorPlaceholder(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  message: string,
): void {
  ctx.fillStyle = "rgba(36, 8, 8, 0.75)";
  ctx.fillRect(0, 0, w, h);
  ctx.fillStyle = "rgba(255, 210, 210, 0.95)";
  ctx.font = "600 15px var(--font-family-base, sans-serif)";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText("Unable to load image", w / 2, h / 2 - 14);
  ctx.font = "500 12px var(--font-family-base, sans-serif)";
  ctx.fillText(message.slice(0, 80), w / 2, h / 2 + 12);
}

function renderFrame(): void {
  if (!canvas || zoomLevel <= 0 || canvasW <= 0 || canvasH <= 0) return;
  const ctx = canvas.getContext("2d");
  if (!ctx) return;

  if (checkerPattern) {
    ctx.fillStyle = checkerPattern;
    ctx.fillRect(0, 0, canvasW, canvasH);
  } else {
    ctx.fillStyle = "#6b6b6b";
    ctx.fillRect(0, 0, canvasW, canvasH);
  }

  if (loading) return;

  if (loadError) {
    drawErrorPlaceholder(ctx, canvasW, canvasH, loadError);
    return;
  }

  if (!bitmap) return;

  const scaledW = mediaWidth * zoomLevel;
  const scaledH = mediaHeight * zoomLevel;
  const destX = Math.round(canvasW / 2 - scaledW / 2 + pan.x);
  const destY = Math.round(canvasH / 2 - scaledH / 2 + pan.y);
  ctx.drawImage(bitmap, destX, destY, scaledW, scaledH);
}

$effect(() => {
  void zoomLevel;
  void pan;
  void canvasW;
  void canvasH;
  void loading;
  void loadError;
  void bitmap;
  void mediaWidth;
  void mediaHeight;
  renderFrame();
});

function doZoomIn(): void {
  zoomLevel = Math.min(zoomLevel * ZOOM_STEP, ZOOM_MAX);
}

function doZoomOut(): void {
  const next = Math.max(zoomLevel / ZOOM_STEP, ZOOM_MIN);
  zoomLevel = next;
  if (!isZoomedIn) {
    pan = { x: 0, y: 0 };
  }
}

function doFitToView(): void {
  zoomLevel = fitScale;
  pan = { x: 0, y: 0 };
}

function doOriginalScale(): void {
  zoomLevel = 1;
  pan = { x: 0, y: 0 };
}

function handleMouseMove(ev: MouseEvent): void {
  if (isDragging && isZoomedIn) {
    pan = { x: dragStartPanX + (ev.clientX - dragStartX), y: dragStartPanY + (ev.clientY - dragStartY) };
  }
}

function handleMouseDown(ev: MouseEvent): void {
  if (ev.button !== 0) return;
  if (isZoomedIn && !loading && !loadError) {
    isDragging = true;
    dragStartX = ev.clientX;
    dragStartY = ev.clientY;
    dragStartPanX = pan.x;
    dragStartPanY = pan.y;
    ev.preventDefault();
  }
}

function handleMouseUp(): void {
  isDragging = false;
}

function handleMouseLeave(): void {
  isDragging = false;
}

function handleWheel(ev: WheelEvent): void {
  if (loading || loadError) return;
  ev.preventDefault();
  if (ev.deltaY < 0) {
    doZoomIn();
  } else {
    doZoomOut();
  }
}

function handleKeyDown(ev: KeyboardEvent): void {
  switch (ev.key) {
    case "Escape":
      overlay.abort();
      break;
    case "ArrowLeft":
      if (isZoomedIn && !loading && !loadError) {
        pan = { x: pan.x + PAN_STEP, y: pan.y };
        ev.preventDefault();
      }
      break;
    case "ArrowRight":
      if (isZoomedIn && !loading && !loadError) {
        pan = { x: pan.x - PAN_STEP, y: pan.y };
        ev.preventDefault();
      }
      break;
    case "ArrowUp":
      if (isZoomedIn && !loading && !loadError) {
        pan = { x: pan.x, y: pan.y + PAN_STEP };
        ev.preventDefault();
      }
      break;
    case "ArrowDown":
      if (isZoomedIn && !loading && !loadError) {
        pan = { x: pan.x, y: pan.y - PAN_STEP };
        ev.preventDefault();
      }
      break;
  }
}

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

function updateCheckerPattern(): void {
  if (!checkerImage || !canvas) return;
  const ctx = canvas.getContext("2d");
  if (ctx) checkerPattern = ctx.createPattern(checkerImage, "repeat") ?? null;
}

onMount(() => {
  const ro = new ResizeObserver((entries) => {
    const rect = entries[0]?.contentRect;
    if (!rect) return;
    canvasW = Math.round(rect.width);
    canvasH = Math.round(rect.height);
    if (canvas) {
      canvas.width = canvasW;
      canvas.height = canvasH;
      updateCheckerPattern();
    }
    if (
      zoomLevel <= 0 &&
      canvasW > 0 &&
      canvasH > 0 &&
      mediaWidth > 0 &&
      mediaHeight > 0
    ) {
      zoomLevel = computeFitScale(canvasW, canvasH, mediaWidth, mediaHeight);
    }
  });
  ro.observe(windowEl);

  const img = new Image();
  img.onload = () => {
    checkerImage = img;
    updateCheckerPattern();
    renderFrame();
  };
  img.src = "/images/ff.jpg";

  windowEl.focus();
  void loadMediaByPayloadId();

  return () => {
    ro.disconnect();
  };
});
</script>

{#snippet separator()}
  <span style:color="var(--color-text-lo-con)">
    <IcoSeparator size={14} weight="bold" aria-hidden="true" />
  </span>
{/snippet}

<!-- svelte-ignore a11y_no_noninteractive_element_interactions -->
<div
  class="iv-window"
  class:iv-window-loading={loading}
  style={loading
    ? "width: min(80vw, 1200px); aspect-ratio: 3 / 2; height: auto; top: 50%; left: 50%; transform: translate(-50%, -50%);"
    : `width: ${initW}px; height: ${initH}px; top: 50%; left: 50%; transform: translate(-50%, -50%);`}
  bind:this={windowEl}
  role="dialog"
  aria-label="Image viewer: {displayName}"
  tabindex="0"
  onmousemove={handleMouseMove}
  onmousedown={handleMouseDown}
  onmouseup={handleMouseUp}
  onmouseleave={handleMouseLeave}
  onwheel={handleWheel}
  onkeydown={handleKeyDown}
>
  {#if loading}
    <div class="iv-loading-overlay" aria-label="Loading image">
      <LoadingSpinner iconSize={32} />
    </div>
  {/if}

  <!-- Drawing surface; CSS sizes it to 100%, attributes set by ResizeObserver -->
  <canvas
    bind:this={canvas}
    class="iv-canvas"
    class:iv-grab={!loading && !loadError && isZoomedIn && !isDragging}
    class:iv-grabbing={isDragging}
    aria-label={displayName}
    style="border: 1px solid var(--color-border-default, rgba(0, 0, 0, 0.3));"
  ></canvas>

  <!-- ── Info banner (top, always visible) ─────────────────────────────────── -->
  <div class="iv-info-banner" aria-label="Image info">
    {assetUri}
    {@render separator()}
    <span class="iv-field iv-name">{displayName}</span>
    {@render separator()}
    <span class="iv-field">{mediaWidth}&thinsp;×&thinsp;{mediaHeight}</span>
    {@render separator()}
    <span class="iv-field">{formatBytes(byteSize)}</span>
    {@render separator()}
    <span class="iv-field iv-format">{format}</span>
  </div>

  <!-- ── Floating action bar (bottom, fades on inactivity) ─────────────────── -->
  <FadingPanel className="iv-fab">
    <div role="toolbar" aria-label="Image controls" class="iv-fab-content">
    <button class="iv-btn" onclick={doZoomOut} title="Zoom out (scroll down)" disabled={loading || !!loadError}>
      <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round">
        <circle cx="9" cy="9" r="5.5"/>
        <line x1="7" y1="9" x2="11" y2="9"/>
        <line x1="13.9" y1="13.9" x2="17" y2="17"/>
      </svg>
    </button>
    <button class="iv-btn" onclick={doFitToView} title="Fit to view" disabled={loading || !!loadError}>
      <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
        <polyline points="3,7 3,3 7,3"/>
        <polyline points="13,3 17,3 17,7"/>
        <polyline points="17,13 17,17 13,17"/>
        <polyline points="7,17 3,17 3,13"/>
      </svg>
    </button>
    <button class="iv-btn" onclick={doOriginalScale} title="Original size (1:1 pixel)" disabled={loading || !!loadError}>
      <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round">
        <rect x="3" y="3" width="5" height="5" rx="0.5"/>
        <rect x="12" y="12" width="5" height="5" rx="0.5"/>
        <line x1="8" y1="10" x2="12" y2="10"/>
        <line x1="10" y1="8" x2="10" y2="12"/>
      </svg>
    </button>
    <button class="iv-btn" onclick={doZoomIn} title="Zoom in (scroll up)" disabled={loading || !!loadError}>
      <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round">
        <circle cx="9" cy="9" r="5.5"/>
        <line x1="9" y1="6.5" x2="9" y2="11.5"/>
        <line x1="6.5" y1="9" x2="11.5" y2="9"/>
        <line x1="13.9" y1="13.9" x2="17" y2="17"/>
      </svg>
    </button>

    <div class="iv-fab-divider"></div>

    <button class="iv-btn iv-btn-close" onclick={() => overlay.abort()} title="Close (Esc)">
      <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round">
        <line x1="5" y1="5" x2="15" y2="15"/>
        <line x1="15" y1="5" x2="5" y2="15"/>
      </svg>
    </button>
    </div>
  </FadingPanel>
</div>

<style>
/* ── Container ──────────────────────────────────────────────────────────────── */
.iv-window {
  position: fixed;
  box-sizing: border-box;
  border: 2px solid var(--color-border-strong, rgba(0 0 0 / 0.8));
  border-radius: 12px;
  overflow: hidden;
  resize: both;
  box-shadow:
    0 12px 48px rgba(0, 0, 0, 0.65),
    0 4px 12px rgba(0, 0, 0, 0.4);
  /* Grab focus so keyboard events work immediately */
  outline: none;
  /* Min size so the window stays usable when resized small */
  min-width: 280px;
  min-height: 200px;
  z-index: 9999;
}

.iv-window.iv-window-loading {
  max-width: 100vw;
}

@media (max-width: 640px) {
  .iv-window.iv-window-loading {
    width: 100vw !important;
  }
}

.iv-loading-overlay {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  pointer-events: none;
  z-index: 2;
}

/* ── Canvas ─────────────────────────────────────────────────────────────────── */
.iv-canvas {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  display: block;
  cursor: default;
}

.iv-canvas.iv-grab {
  cursor: grab;
}

.iv-canvas.iv-grabbing {
  cursor: grabbing;
}

/* ── Info banner (top centre overlay) ──────────────────────────────────────── */
.iv-info-banner {
  position: absolute;
  top: var(--space-6);
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  align-items: center;
  gap: var(--space-2);
  padding: var(--space-2) var(--space-4);
  border: 1px solid var(--color-border-default);
  border-radius: var(--radius-full);
  background: color-mix(in srgb, var(--color-bg-0) 75%, transparent);
  backdrop-filter: var(--backdrop-filter);
  -webkit-backdrop-filter: var(--backdrop-filter);
  color: var(--color-text-hi-con);
  font-size: var(--font-size-xs);
  font-weight: var(--font-weight-medium);
  white-space: nowrap;
  pointer-events: none;
}

.iv-field.iv-name {
  max-width: 22ch;
  overflow: hidden;
  text-overflow: ellipsis;
}

.iv-field.iv-format {
  font-size: var(--font-size-xxs);
  font-weight: var(--font-weight-bold);
  text-transform: uppercase;
  letter-spacing: var(--letter-spacing-loose);
  opacity: 0.75;
}

/* ── Floating action bar (bottom centre overlay) ────────────────────────────── */
:global(.iv-fab) {
  position: absolute;
  bottom: var(--space-6);
  left: 50%;
  transform: translateX(-50%);
}

.iv-fab-content {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  padding: var(--space-2) var(--space-4);
  border: 1px solid var(--color-border-subtle);
  border-radius: var(--radius-lg);
  background: color-mix(in srgb, var(--color-bg-0) 50%, transparent);
  backdrop-filter: var(--backdrop-filter);
  -webkit-backdrop-filter: var(--backdrop-filter);
  color: var(--color-text-hi-con);
  box-shadow: 0 4px 16px var(--color-flip-bg-0);
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-medium);
}

.iv-fab-divider {
  width: 1px;
  height: 1.25rem;
  background: currentColor;
  opacity: 0.2;
  margin: 0 0.125rem;
}

/* ── FAB buttons ────────────────────────────────────────────────────────────── */
.iv-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 2rem;
  height: 2rem;
  padding: 0;
  border: none;
  border-radius: 50%;
  background: transparent;
  cursor: pointer;
  color: inherit;
  transition:
    background 0.15s,
    color 0.15s;
}

.iv-btn svg {
  width: 1.125rem;
  height: 1.125rem;
}

.iv-btn:hover {
  background: rgba(128, 128, 128, 0.25);
}

.iv-btn:active {
  background: rgba(128, 128, 128, 0.4);
}

.iv-btn:disabled {
  opacity: 0.45;
  cursor: default;
}

.iv-btn-close:hover {
  background: rgba(170, 40, 40, 0.262);
  color: #f66d6d;
}
</style>
