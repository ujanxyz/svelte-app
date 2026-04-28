# Svelte Overlay Library

Svelte 5 + TypeScript library to manage overlay UIs.

Features:

- Open an overlay from a render snippet.
- Resolve the overlay with typed data.
- Abort or dismiss the overlay from inside its content.
- Await overlay completion with an async API.
- Stack overlays and automatically abort descendants when a parent closes.

## Public API

- `OverlayRoot`: hosts the overlay stack and provides manager context.
- `createOverlayManager()`: creates an isolated overlay manager instance.
- `createOverlayController(manager, render)`: creates a typed overlay controller in plain TypeScript.
- `useOverlayController(render)`: creates a typed overlay controller from the nearest `OverlayRoot`.
- `useOverlayInstance()`: accesses the current overlay payload and close controls from inside overlay content.
- `overlayStatuses`: typed status constants for async results.

## Example

```svelte
<script lang="ts">
	import Dialog from "./Dialog.svelte";
	import {
		OverlayRoot,
		overlayStatuses,
		useOverlayController,
	} from "@/overlay2";

	interface ConfirmPayload {
		title: string;
	}

	const confirmDialog = useOverlayController<ConfirmPayload, boolean>(renderDialog);

	async function askForConfirmation() {
		const result = await confirmDialog.open({ title: "Delete file?" });
		if (result.status === overlayStatuses.OK) {
			console.log("confirmed", result.value);
			return;
		}

		console.log("closed", result.status, result.reason);
	}
</script>

<OverlayRoot>
	<button onclick={askForConfirmation}>Open dialog</button>
</OverlayRoot>

{#snippet renderDialog()}
	<Dialog />
{/snippet}
```

```svelte
<script lang="ts">
	import { overlayStatuses, useOverlayInstance } from "@/overlay2";

	interface ConfirmPayload {
		title: string;
	}

	const overlay = useOverlayInstance<ConfirmPayload, boolean>();
</script>

<div class="dialog-shell">
	<div class="dialog-card">
		<h2>{overlay.payload.title}</h2>
		<button onclick={() => overlay.settle(true)}>Confirm</button>
		<button onclick={() => overlay.abort(overlayStatuses.ABORTED)}>Cancel</button>
	</div>
</div>
```

## Notes

- Backdrop click and `Escape` dismissal are enabled by default.
- `closeOnWindowResize` is opt-in.
- Overlay content is rendered inside a full-screen fixed layer, so each overlay can position itself freely.
