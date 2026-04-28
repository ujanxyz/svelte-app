<script lang="ts" context="module">
export interface DialogPayload {
  title: string;
  message: string;
}
</script>


<script lang="ts">
import PickFile from "@/modules/sloteditor/PickFile.svelte";

import { overlayStatuses, useOverlayInstance } from "../index";


const overlay = useOverlayInstance<DialogPayload, boolean>();
</script>

<!-- svelte-ignore a11y_no_noninteractive_element_interactions -->
<div
  class="shell"
  role="dialog"
  aria-modal="true"
  aria-labelledby="dialog-title"
>
  <div class="card">
    <h2 id="dialog-title" class="title">{overlay.payload.title}</h2>
    <p class="message">{overlay.payload.message}</p>
    <PickFile />
    <div class="actions">
      <button
        class="btn btn-secondary"
        onclick={() => overlay.abort(overlayStatuses.ABORTED)}
      >
        Cancel
      </button>
      <button
        class="btn btn-primary"
        onclick={() => overlay.settle(true)}
      >
        Confirm
      </button>
    </div>
  </div>
</div>

<style>
.shell {
  position: fixed;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(0, 0, 0, 0.45);
}

.card {
  background: #ffffff;
  border-radius: 10px;
  padding: 28px 32px;
  width: 360px;
  max-width: 90vw;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.22);
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.title {
  font-size: 1.2rem;
  font-weight: 600;
  margin: 0;
  color: #171717;
}

.message {
  font-size: 0.92rem;
  color: #555;
  margin: 0;
}

.actions {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
  margin-top: 4px;
}

.btn {
  padding: 7px 18px;
  border-radius: 6px;
  font-size: 0.88rem;
  font-weight: 500;
  cursor: pointer;
  border: 1px solid transparent;
}

.btn-secondary {
  background: #f3f4f6;
  color: #374151;
  border-color: #d1d5db;
}

.btn-secondary:hover {
  background: #e5e7eb;
}

.btn-primary {
  background: #2563eb;
  color: #fff;
}

.btn-primary:hover {
  background: #1d4ed8;
}
</style>
