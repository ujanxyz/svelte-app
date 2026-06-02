<script lang="ts">
import { onDestroy } from "svelte";

/**
 * CrossViewDragDrop demonstrates a drag "portal" between two UIs:
 * drag a payload in View A, hover over the portal control for a short delay,
 * auto-switch to View B, then drop into the target zone.
 */

type View = "A" | "B";

type Props = {
	initialView?: View;
	switchDelayMs?: number;
};

type Payload = {
	message: string;
	source: View;
	sentAt: string;
};

const PORTAL_MIME = "application/x-cross-view-payload";

const {
	initialView = "A",
	switchDelayMs = 1000,
}: Props = $props();

let currentView = $state<View>("A");
let droppedData = $state<string>("");
let isPortalArmed = $state(false);
let portalDragDepth = $state(0);
let portalTimer: ReturnType<typeof setTimeout> | null = null;

$effect(() => {
	currentView = initialView;
});

const nextView = $derived(currentView === "A" ? "B" : "A");
const hasDrop = $derived(droppedData.length > 0);
const portalLabel = $derived(
	isPortalArmed
		? `Opening View ${nextView}...`
		: `Hold Drag Here to Open View ${nextView}`,
);

function cleanupPortalTimer(): void {
	if (!portalTimer) return;
	clearTimeout(portalTimer);
	portalTimer = null;
}

function resetPortalArming(): void {
	portalDragDepth = 0;
	isPortalArmed = false;
	cleanupPortalTimer();
}

function hasValidPayload(event: DragEvent): boolean {
	return !!event.dataTransfer?.types.includes(PORTAL_MIME);
}

function handleDragStartA(event: DragEvent): void {
	if (!event.dataTransfer) return;

	const payload: Payload = {
		message: "Hello from View A",
		source: "A",
		sentAt: new Date().toISOString(),
	};

	event.dataTransfer.setData(PORTAL_MIME, JSON.stringify(payload));
	event.dataTransfer.effectAllowed = "move";
}

function handleDragEndA(): void {
	resetPortalArming();
}

function handleDragOverB(event: DragEvent): void {
	event.preventDefault();
	if (event.dataTransfer) {
		event.dataTransfer.dropEffect = "move";
	}
}

function handleDropB(event: DragEvent): void {
	event.preventDefault();
	if (!event.dataTransfer) return;

	const raw = event.dataTransfer.getData(PORTAL_MIME);
	if (!raw) return;

	try {
		const payload = JSON.parse(raw) as Payload;
		droppedData = `${payload.message} (${payload.source})`;
	} catch {
		droppedData = "Invalid payload";
	}
}

function handlePortalDragEnter(event: DragEvent): void {
	if (!hasValidPayload(event)) return;

	event.preventDefault();
	portalDragDepth += 1;
	if (isPortalArmed || portalTimer) return;

	isPortalArmed = true;
	portalTimer = setTimeout(() => {
		currentView = nextView;
		resetPortalArming();
	}, switchDelayMs);
}

function handlePortalDragOver(event: DragEvent): void {
	if (!hasValidPayload(event)) return;
	event.preventDefault();
	if (event.dataTransfer) {
		event.dataTransfer.dropEffect = "move";
	}
}

function handlePortalDragLeave(): void {
	portalDragDepth = Math.max(0, portalDragDepth - 1);
	if (portalDragDepth > 0) return;
	resetPortalArming();
}

function handlePortalDrop(event: DragEvent): void {
	event.preventDefault();
	resetPortalArming();
}

onDestroy(() => {
	cleanupPortalTimer();
});
</script>

<section class="crossview-shell" aria-label="Cross view drag and drop demo">
	<header class="title-row">
		<p class="eyebrow">Switcher Demo</p>
		<h2>Cross-View Drag Portal</h2>
		<p class="subtitle">Carry a payload from one view, hold over the portal, then land in the other view.</p>
	</header>

	<main class="workspace" aria-live="polite">
		{#if currentView === "A"}
			<article class="card view-a">
				<div class="view-head">
					<span class="view-chip">View A</span>
					<p>Prepare a payload and drag it to the portal below.</p>
				</div>

				<button
					type="button"
					class="draggable-item"
					draggable="true"
					ondragstart={handleDragStartA}
					ondragend={handleDragEndA}
					aria-label="Draggable custom data payload"
				>
					<span class="item-icon" aria-hidden="true">◉</span>
					<span>Custom Data Payload</span>
				</button>
			</article>
		{:else}
			<article class="card view-b">
				<div class="view-head">
					<span class="view-chip">View B</span>
					<p>Drop the payload into the zone to confirm transport.</p>
				</div>

				<div class="drop-zone" ondragover={handleDragOverB} ondrop={handleDropB} role="region" aria-label="Payload drop zone">
					{#if hasDrop}
						<span class="success">Received: {droppedData}</span>
					{:else}
						<span class="placeholder">Drop payload here</span>
					{/if}
				</div>
			</article>
		{/if}
	</main>

	<button
		type="button"
		class="portal-btn"
		class:portal-armed={isPortalArmed}
		ondragenter={handlePortalDragEnter}
		ondragover={handlePortalDragOver}
		ondragleave={handlePortalDragLeave}
		ondrop={handlePortalDrop}
		aria-label={portalLabel}
	>
		<span class="portal-pulse" aria-hidden="true"></span>
		<span>{portalLabel}</span>
	</button>
</section>

<style>
.crossview-shell {
	--cv-font-ui: "Public Sans", "Avenir Next", "Segoe UI", sans-serif;
	--cv-font-mono: "IBM Plex Mono", "SFMono-Regular", Menlo, monospace;

	--cv-bg-start: #e7f6ff;
	--cv-bg-end: #fff8ec;
	--cv-panel-bg: rgba(255, 255, 255, 0.84);
	--cv-panel-border: rgba(9, 50, 84, 0.12);
	--cv-text: #0f2539;
	--cv-subtle: #506176;

	--cv-a-accent: #0f766e;
	--cv-b-accent: #b45309;
	--cv-success: #047857;
	--cv-portal: #0b3b5c;
	--cv-portal-hot: #0e7490;

	width: min(100%, 760px);
	margin: 0 auto;
	padding: clamp(1rem, 2.8vw, 1.75rem);
	border-radius: 24px;
	border: 1px solid var(--cv-panel-border);
	background:
		radial-gradient(120% 90% at 0% 100%, color-mix(in srgb, var(--cv-bg-start) 84%, white 16%), transparent),
		radial-gradient(120% 90% at 100% 0%, color-mix(in srgb, var(--cv-bg-end) 80%, white 20%), transparent),
		var(--cv-panel-bg);
	box-shadow: 0 24px 56px rgba(12, 43, 64, 0.16);

	display: grid;
	gap: 1rem;

	color: var(--cv-text);
	font-family: var(--cv-font-ui);
}

.title-row {
	display: grid;
	gap: 0.35rem;
}

.eyebrow {
	margin: 0;
	font-size: 0.72rem;
	letter-spacing: 0.14em;
	text-transform: uppercase;
	color: var(--cv-subtle);
	font-family: var(--cv-font-mono);
}

h2 {
	margin: 0;
	font-size: clamp(1.2rem, 2.6vw, 1.8rem);
	line-height: 1.15;
}

.subtitle {
	margin: 0;
	font-size: 0.92rem;
	color: var(--cv-subtle);
}

.workspace {
	min-height: 260px;
}

.card {
	border-radius: 18px;
	border: 1px solid var(--cv-panel-border);
	background: #fff;
	padding: clamp(1rem, 2.6vw, 1.4rem);
	box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.75), 0 10px 30px rgba(8, 34, 56, 0.08);
	display: grid;
	gap: 0.95rem;
}

.view-a {
	border-left: 6px solid color-mix(in srgb, var(--cv-a-accent) 65%, white 35%);
}

.view-b {
	border-left: 6px solid color-mix(in srgb, var(--cv-b-accent) 70%, white 30%);
}

.view-head {
	display: grid;
	gap: 0.45rem;
}

.view-head p {
	margin: 0;
	color: var(--cv-subtle);
}

.view-chip {
	width: fit-content;
	border-radius: 999px;
	padding: 0.2rem 0.65rem;
	font-size: 0.75rem;
	font-weight: 700;
	letter-spacing: 0.05em;
	background: color-mix(in srgb, #ffffff 70%, #dbeafe 30%);
	border: 1px solid var(--cv-panel-border);
}

.draggable-item {
	width: 100%;
	display: inline-flex;
	align-items: center;
	justify-content: center;
	gap: 0.55rem;
	border: 1px solid color-mix(in srgb, var(--cv-a-accent) 40%, #d5e9e7 60%);
	background: linear-gradient(135deg, #f0fdfa, #ffffff);
	border-radius: 12px;
	padding: 0.95rem;
	color: #0f3b38;
	cursor: grab;
	font: inherit;
	font-weight: 600;
}

.draggable-item:active {
	cursor: grabbing;
}

.item-icon {
	width: 1.1rem;
	height: 1.1rem;
	display: inline-grid;
	place-items: center;
	color: var(--cv-a-accent);
}

.drop-zone {
	border: 1px dashed color-mix(in srgb, var(--cv-b-accent) 45%, #f5dfc1 55%);
	border-radius: 12px;
	min-height: 110px;
	display: grid;
	place-items: center;
	background: linear-gradient(135deg, #fffaf0, #ffffff);
	padding: 0.8rem;
}

.placeholder {
	color: var(--cv-subtle);
}

.success {
	color: var(--cv-success);
	font-weight: 700;
}

.portal-btn {
	position: relative;
	isolation: isolate;
	width: 100%;
	border: 0;
	border-radius: 14px;
	padding: 0.9rem 1.05rem;
	display: inline-flex;
	justify-content: center;
	align-items: center;
	gap: 0.55rem;
	color: #f8fbff;
	background: linear-gradient(135deg, var(--cv-portal), color-mix(in srgb, var(--cv-portal) 68%, #0a9396 32%));
	font: inherit;
	font-weight: 700;
	letter-spacing: 0.01em;
	cursor: default;
	box-shadow: 0 10px 28px rgba(10, 55, 83, 0.28);
}

.portal-pulse {
	width: 0.65rem;
	aspect-ratio: 1;
	border-radius: 999px;
	background: #6ee7ff;
	box-shadow: 0 0 0 0 rgba(110, 231, 255, 0.5);
}

.portal-armed {
	background: linear-gradient(135deg, var(--cv-portal-hot), color-mix(in srgb, var(--cv-portal-hot) 70%, #e11d48 30%));
	animation: portal-flicker 260ms steps(2, jump-none) infinite;
}

.portal-armed .portal-pulse {
	animation: pulse-ring 900ms ease-out infinite;
}

@keyframes portal-flicker {
	0% { filter: brightness(1); }
	50% { filter: brightness(1.2); }
	100% { filter: brightness(1.04); }
}

@keyframes pulse-ring {
	0% {
		box-shadow: 0 0 0 0 rgba(110, 231, 255, 0.55);
	}
	100% {
		box-shadow: 0 0 0 12px rgba(110, 231, 255, 0);
	}
}

@media (max-width: 640px) {
	.crossview-shell {
		border-radius: 18px;
		padding: 0.9rem;
	}

	.workspace {
		min-height: 220px;
	}
}
</style>
