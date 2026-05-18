<script lang="ts">
import { getContext, onMount } from "svelte";

import type { grph } from "@/types/grph";
import { AssetType } from "@/types/worker-message-types";
import { IoWorkerApi } from "@/webworkerclient/IoWorkerApi";

import PickFileRow from "./PickFileRow.svelte";

interface Props {
  initial: grph.EncodedData | null;
  onData: (edited: grph.EncodedData) => void;
}

interface PickFilePayload {
	assetUri: string;
}

const { initial, onData }: Props = $props();

const io = getContext(IoWorkerApi.CONTEXT_KEY) as IoWorkerApi;

interface PickFileItem {
	id: string;
	filename: string;
	subtitle: string;
	assetUri: string;
	thumbnailBitmap: ImageBitmap;
}

let items = $state.raw<PickFileItem[]>([]);
let selectedId = $state<string>("");
let loading = $state(true);
let loadError = $state<string | null>(null);
let initialAssetUri = "";

let ondataUpdateTimeoutId: ReturnType<typeof setTimeout> | null = null;
const orderedItems = $derived([...items].sort((a, b) => a.filename.localeCompare(b.filename)));
const selectedItem = $derived(orderedItems.find((item) => item.id === selectedId) ?? null);

onMount(async () => {
	parseInitialIoData();
	await refreshMediaItems();
	loading = false;
});

async function refreshMediaItems(): Promise<void> {
	loadError = null;
	try {
		const { assetEntries } = await io.listAssets({ assetType: AssetType.MEDIA });
		items = assetEntries.map(({ summary, thumbnail }) => toPickItem(summary.uri, thumbnail));

		const preselected = items.find((item) => item.assetUri === initialAssetUri);
		if (preselected) {
			selectedId = preselected.id;
		} else if (selectedId && !items.some((item) => item.id === selectedId)) {
			selectedId = "";
		}
	} catch (err) {
		const message = err instanceof Error ? err.message : String(err);
		loadError = `Failed to fetch media list: ${message}`;
		items = [];
		selectedId = "";
	}
}

function selectItem(id: string): void {
	selectedId = id;
}

function applySelection(): void {
	if (!selectedItem) return;
	const data: grph.EncodedData = {
		payload: JSON.stringify({ assetUri: selectedItem.assetUri }),
	};
	scheduleOndataUpdate(data);
}

function clearSelection(): void {
	selectedId = "";
	const data: grph.EncodedData = {
		payload: JSON.stringify({ assetUri: "" }),
	};
	scheduleOndataUpdate(data);
}

// Call onData after 0.1 seconds, also cancel any previously scheduled timeout.
function scheduleOndataUpdate(data: grph.EncodedData): void {
	if (ondataUpdateTimeoutId) {
		clearTimeout(ondataUpdateTimeoutId);
	}
	ondataUpdateTimeoutId = setTimeout(() => {
		ondataUpdateTimeoutId = null;
		onData(data);
	}, 200);
}

function parseInitialIoData(): void {
  if (!initial || typeof initial !== "object" || !("payload" in initial)) return;
  const payload = initial.payload;
  if (typeof payload !== "string") return;
  let parsed: any;
  try {
    parsed = JSON.parse(payload);
  } catch (e) {
    console.warn("Failed to parse initial payload as JSON: ", payload);
    return;
  }
  if (typeof parsed !== "object") return;
	const prior = parsed as Partial<PickFilePayload>;
	if (typeof prior.assetUri === "string") {
		initialAssetUri = prior.assetUri;
	}
}

function toPickItem(uri: string, thumbnailBitmap: ImageBitmap): PickFileItem {
	const id = extractMediaIdFromUri(uri);
	const filename = id || uri;
	return {
		id: filename,
		filename,
		subtitle: `${thumbnailBitmap.width} x ${thumbnailBitmap.height}`,
		assetUri: uri,
		thumbnailBitmap,
	};
}

function extractMediaIdFromUri(uri: string): string {
	if (typeof uri !== "string") return "";
	if (!uri.startsWith("idb:/media/")) return "";
	return uri.slice("idb:/media/".length);
}
</script>

<div class="picker-shell">
	<div class="toolbar">
		<div class="title">Media Asset</div>
		<button class="btn" onclick={refreshMediaItems} title="Refresh media list">Refresh</button>
	</div>

	<div class="subtext">Select a previously uploaded media file (read-only).</div>

	{#if loading}
		<div class="state">Loading media...</div>
	{:else if loadError}
		<div class="state error">{loadError}</div>
	{:else if orderedItems.length === 0}
		<div class="state">No media files available.</div>
	{:else}
		<div class="list" role="listbox" aria-label="Available media files">
			{#each orderedItems as item (item.id)}
				<PickFileRow
					item={item}
					selected={selectedId === item.id}
					onselect={selectItem}
				/>
			{/each}
		</div>
	{/if}

	<div class="footer">
		<div class="selected-uri" title={selectedItem?.assetUri || ""}>
			{#if selectedItem}
				{selectedItem.assetUri}
			{:else}
				No asset selected
			{/if}
		</div>

		<div class="actions">
			<button class="btn" onclick={clearSelection}>Clear</button>
			<button class="btn primary" onclick={applySelection} disabled={!selectedItem}>Apply</button>
		</div>
	</div>
</div>

<style>
.picker-shell {
	width: min(24rem, 100%);
	display: flex;
	flex-direction: column;
	gap: 0.5rem;
}

.toolbar {
	display: flex;
	align-items: center;
	justify-content: space-between;
}

.title {
	font-size: 0.8rem;
	font-weight: 700;
}

.subtext {
	font-size: 0.65rem;
	color: rgba(255 255 255 / 0.7);
}

.list {
	max-height: 16rem;
	overflow: auto;
	display: flex;
	flex-direction: column;
	gap: 0.4rem;
	padding-right: 3px;
}

.footer {
	display: flex;
	flex-direction: column;
	gap: 0.45rem;
}

.selected-uri {
	font-size: var(--font-size-xxs);
	border: 1px solid var(--color-border-subtle);
	border-radius: var(--radius-sm);
	padding: var(--space-2) var(--space-3);
	font-family: var(--font-family-mono);
	white-space: nowrap;
	overflow: hidden;
	text-overflow: ellipsis;
}

.actions {
	display: flex;
	justify-content: flex-end;
	gap: 0.35rem;
}

.btn {
	border-radius: 6px;
	border: 1px solid rgba(255 255 255 / 0.22);
	background: rgba(255 255 255 / 0.08);
	color: inherit;
	font-size: 0.68rem;
	padding: 0.3rem 0.55rem;
	cursor: pointer;
}

.btn:hover {
	background: rgba(255 255 255 / 0.14);
}

.btn:disabled {
	opacity: 0.45;
	cursor: default;
}

.btn.primary {
	background: rgba(48 134 214 / 0.3);
	border-color: rgba(71 159 241 / 0.65);
}

.state {
	min-height: 5rem;
	display: grid;
	place-items: center;
	font-size: 0.72rem;
	border: 1px solid rgba(255 255 255 / 0.12);
	border-radius: 8px;
	background: rgba(255 255 255 / 0.03);
}

.state.error {
	color: #ff8f8f;
}

:global(.contextmenu .picker-shell *) {
	box-sizing: border-box;
}
</style>