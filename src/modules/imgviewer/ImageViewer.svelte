<script lang="ts">
import { getContext, onMount } from "svelte";

import { computeFitScale } from "@/utils/canvasUtils";
import type { GraphIoManager } from "@/webworkerclient/GraphIoManager";
import { useOverlayInstance } from "../overlay2";

const ZOOM_STEP = 1.25;
const PAN_STEP = 40;
const FADE_DELAY_MS = 2500;
const INITIAL_MAX_W = 1200;
const INITIAL_MAX_H = 800;
const ARTIFICIAL_DELAY_MS = 2000;

const io = getContext(Symbol.for("GraphIoManager")) as GraphIoManager;
const overlay = useOverlayInstance<{ id: string }, void>();

let bitmap = $state<ImageBitmap | null>(null);
let displayName = $state("Loading media...");
let mediaWidth = $state(1280);
let mediaHeight = $state(720);
let byteSize = $state(0);
let format = $state("PNG");
let loading = $state(true);
let loadError = $state<string | null>(null);

// DOM refs (assigned by bind:this, not reactive state)
let windowEl: HTMLDivElement;
let canvas: HTMLCanvasElement;

// Reactive state
let zoomLevel = $state(0); // 0 = not yet initialized
let panX = $state(0);
let panY = $state(0);
let canvasW = $state(0);
let canvasH = $state(0);
let actionBarVisible = $state(true);
let isDragging = $state(false);

// Non-reactive helpers
let checkerImage: HTMLImageElement | null = null;
let checkerPattern: CanvasPattern | null = null;
let fadeTimer: ReturnType<typeof setTimeout> | null = null;
let dragStartX = 0;
let dragStartY = 0;
let dragStartPanX = 0;
let dragStartPanY = 0;

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

async function loadMediaByPayloadId(): Promise<void> {
  const id = overlay.payload?.id;
  if (!id) {
    loadError = "Missing media id in overlay payload.";
    loading = false;
    return;
  }

  loading = true;
  loadError = null;
  bitmap = null;

  try {
    const [response] = await Promise.all([
      io.getMediaData({ id }),
      wait(ARTIFICIAL_DELAY_MS),
    ]);
    bitmap = response.bitmap;
    displayName = response.meta.filename;
    byteSize = response.meta.byteSize;
    format = inferFormat(response.meta.filename, response.meta.mimeType);

    const dim = response.meta.dimension;
    if (Array.isArray(dim) && dim.length === 2) {
      mediaWidth = dim[0];
      mediaHeight = dim[1];
    } else {
      mediaWidth = response.bitmap.width;
      mediaHeight = response.bitmap.height;
    }

    zoomLevel = 0;
    panX = 0;
    panY = 0;
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    loadError = `Failed to load media: ${message}`;
  } finally {
    loading = false;
  }
}

function drawLoadingPlaceholder(ctx: CanvasRenderingContext2D, w: number, h: number): void {
  const boxW = Math.round(Math.min(420, w * 0.6));
  const boxH = Math.round(Math.min(170, h * 0.4));
  const x = Math.round((w - boxW) / 2);
  const y = Math.round((h - boxH) / 2);
  ctx.fillStyle = "rgba(20, 20, 20, 0.58)";
  ctx.fillRect(x, y, boxW, boxH);
  ctx.strokeStyle = "rgba(255,255,255,0.22)";
  ctx.lineWidth = 1;
  ctx.strokeRect(x + 0.5, y + 0.5, boxW - 1, boxH - 1);

  ctx.fillStyle = "rgba(255,255,255,0.92)";
  ctx.font = "600 16px var(--font-family-base, sans-serif)";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText("Loading image...", x + boxW / 2, y + boxH / 2 - 8);

  ctx.fillStyle = "rgba(255,255,255,0.45)";
  ctx.font = "500 12px var(--font-family-base, sans-serif)";
  ctx.fillText("Fetching bitmap from worker", x + boxW / 2, y + boxH / 2 + 18);
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

  if (loading) {
    drawLoadingPlaceholder(ctx, canvasW, canvasH);
    return;
  }

  if (loadError) {
    drawErrorPlaceholder(ctx, canvasW, canvasH, loadError);
    return;
  }

  if (!bitmap) return;

  const scaledW = mediaWidth * zoomLevel;
  const scaledH = mediaHeight * zoomLevel;
  const destX = Math.round(canvasW / 2 - scaledW / 2 + panX);
  const destY = Math.round(canvasH / 2 - scaledH / 2 + panY);
  ctx.drawImage(bitmap, destX, destY, scaledW, scaledH);
}

$effect(() => {
  void zoomLevel;
  void panX;
  void panY;
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
  zoomLevel *= ZOOM_STEP;
}

function doZoomOut(): void {
  const next = zoomLevel / ZOOM_STEP;
  zoomLevel = next;
  if (!isZoomedIn) {
    panX = 0;
    panY = 0;
  }
}

function doFitToView(): void {
  zoomLevel = fitScale;
  panX = 0;
  panY = 0;
}

function doOriginalScale(): void {
  zoomLevel = 1;
  panX = 0;
  panY = 0;
}

function resetFadeTimer(): void {
  actionBarVisible = true;
  if (fadeTimer !== null) clearTimeout(fadeTimer);
  fadeTimer = setTimeout(() => {
    actionBarVisible = false;
  }, FADE_DELAY_MS);
}

function handleMouseMove(ev: MouseEvent): void {
  resetFadeTimer();
  if (isDragging && isZoomedIn) {
    panX = dragStartPanX + (ev.clientX - dragStartX);
    panY = dragStartPanY + (ev.clientY - dragStartY);
  }
}

function handleMouseDown(ev: MouseEvent): void {
  if (ev.button !== 0) return;
  if (isZoomedIn && !loading && !loadError) {
    isDragging = true;
    dragStartX = ev.clientX;
    dragStartY = ev.clientY;
    dragStartPanX = panX;
    dragStartPanY = panY;
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
        panX += PAN_STEP;
        ev.preventDefault();
      }
      break;
    case "ArrowRight":
      if (isZoomedIn && !loading && !loadError) {
        panX -= PAN_STEP;
        ev.preventDefault();
      }
      break;
    case "ArrowUp":
      if (isZoomedIn && !loading && !loadError) {
        panY += PAN_STEP;
        ev.preventDefault();
      }
      break;
    case "ArrowDown":
      if (isZoomedIn && !loading && !loadError) {
        panY -= PAN_STEP;
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
  img.src = "/images/CheckerBoardSeemlessPattern.jpg";

  windowEl.focus();
  resetFadeTimer();
  void loadMediaByPayloadId();

  return () => {
    ro.disconnect();
    if (fadeTimer !== null) clearTimeout(fadeTimer);
  };
});
</script>

<!-- svelte-ignore a11y_no_noninteractive_element_interactions -->
<div
  class="iv-window"
  style="width: {initW}px; height: {initH}px;"
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
  <!-- Drawing surface; CSS sizes it to 100%, attributes set by ResizeObserver -->
  <canvas
    bind:this={canvas}
    class="iv-canvas"
    class:iv-grab={!loading && !loadError && isZoomedIn && !isDragging}
    class:iv-grabbing={isDragging}
    aria-label={displayName}
  ></canvas>

  <!-- ── Info banner (top, always visible) ─────────────────────────────────── -->
  <div class="iv-info-banner" aria-label="Image info">
    <span class="iv-field iv-name">{displayName}</span>
    <span class="iv-sep">·</span>
    <span class="iv-field">{mediaWidth}&thinsp;×&thinsp;{mediaHeight}</span>
    <span class="iv-sep">·</span>
    <span class="iv-field">{formatBytes(byteSize)}</span>
    <span class="iv-sep">·</span>
    <span class="iv-field iv-format">{format}</span>
  </div>

  <!-- ── Floating action bar (bottom, fades on inactivity) ─────────────────── -->
  <div class="iv-fab" class:iv-fab-hidden={!actionBarVisible} role="toolbar" aria-label="Image controls">
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
</div>

<style>
/* ── Container ──────────────────────────────────────────────────────────────── */
.iv-window {
  position: relative;
  box-sizing: border-box;
  border: 2px solid var(--color-border-default, rgba(0 0 0 / 0.5));
  border-radius: 10px;
  overflow: hidden;
  resize: both;
  box-shadow:
    0 8px 32px rgba(0, 0, 0, 0.55),
    0 2px 8px rgba(0, 0, 0, 0.3);
  /* Grab focus so keyboard events work immediately */
  outline: none;
  /* Min size so the window stays usable when resized small */
  min-width: 280px;
  min-height: 200px;
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
  top: 0.875rem;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  align-items: center;
  gap: 0.375rem;
  padding: 0.3rem 0.875rem;
  border-radius: 999px;
  backdrop-filter: blur(12px) saturate(1.2);
  -webkit-backdrop-filter: blur(12px) saturate(1.2);
  white-space: nowrap;
  pointer-events: none;
  font-size: 0.72rem;
  font-weight: 500;
  letter-spacing: 0.01em;
  /* Light theme: black text on white 20 % */
  background: rgba(255, 255, 255, 0.2);
  color: rgb(0 0 0 / 0.87);
  border: 1px solid rgba(255, 255, 255, 0.35);
}

@media (prefers-color-scheme: dark) {
  .iv-info-banner {
    /* Dark theme: white text on black 20 % */
    background: rgba(0, 0, 0, 0.2);
    color: rgb(255 255 255 / 0.87);
    border-color: rgba(255, 255, 255, 0.15);
  }
}

.iv-sep {
  opacity: 0.45;
}

.iv-field.iv-name {
  max-width: 22ch;
  overflow: hidden;
  text-overflow: ellipsis;
}

.iv-field.iv-format {
  font-size: 0.65rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  opacity: 0.75;
}

/* ── Floating action bar (bottom centre overlay) ────────────────────────────── */
.iv-fab {
  position: absolute;
  bottom: 2rem;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  align-items: center;
  gap: 0.25rem;
  padding: 0.375rem 0.5rem;
  border-radius: 999px;
  backdrop-filter: blur(16px) saturate(1.3);
  -webkit-backdrop-filter: blur(16px) saturate(1.3);
  background: rgba(255, 255, 255, 0.18);
  border: 1px solid rgba(255, 255, 255, 0.35);
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.35);
  transition: opacity 0.45s ease;
  opacity: 1;
}

@media (prefers-color-scheme: dark) {
  .iv-fab {
    background: rgba(0, 0, 0, 0.35);
    border-color: rgba(255, 255, 255, 0.12);
  }
}

.iv-fab.iv-fab-hidden {
  opacity: 0;
  pointer-events: none;
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
  background: rgba(220, 50, 50, 0.25);
  color: #e05050;
}
</style>
