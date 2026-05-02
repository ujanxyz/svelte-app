<script lang="ts">
import "filepond/dist/filepond.min.css";

import type {
  ActualFileObject,
  ProcessServerConfigFunction,
  ProgressServerConfigFunction,
} from "filepond";
import FilePond from "svelte-filepond";

interface Props {
  onUpload: (file: File) => Promise<string>;
  disabled?: boolean;
}

const { onUpload, disabled = false }: Props = $props();

let pond: any;
const MAX_SIZE_BYTES = 10 * 1024 * 1024;

function isSupportedMedia(file: File): boolean {
  return file.type.startsWith("image/") || file.type.startsWith("video/");
}

async function processFile(
  _fieldName: string,
  file: ActualFileObject,
  _metadata: { [key: string]: any },
  load: (p: string | { [key: string]: any }) => void,
  error: (errorText: string) => void,
  progress: ProgressServerConfigFunction,
): Promise<void> {
  console.log("In DropZone Processing file: ", file);
  try {
    const fileObj = file as File;
    if (!isSupportedMedia(fileObj)) {
      error("Only image/video files are supported");
      return;
    }
    if (fileObj.size > MAX_SIZE_BYTES) {
      error("File size exceeds 10MB");
      return;
    }

    progress(false, 0, 100);
    const fileId = await onUpload(fileObj) as string;
    progress(false, 100, 100);
    load(fileId);
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Failed to upload";
    error(msg);
  }
}

const server = {
  process: processFile as ProcessServerConfigFunction,
};

function openPicker(): void {
  if (!pond) return;
  pond.browse();
}
</script>

<div class="dropzone-shell" data-debug-name="file-dropzone">
  <FilePond
    bind:this={pond}
    name="media"
    {server}
    allowMultiple={true}
    credits={false}
    allowRevert={false}
    disabled={disabled}
    labelIdle='<span class="dz-title">Drag &amp; drop media here</span><span class="dz-subtitle">PNG, JPG, WEBP, MP4 up to 10MB</span><span class="dz-or">or</span><button type="button" class="dz-browse">Browse Files</button>'
  />
  <button type="button" class="browse-overlay" onclick={openPicker} aria-label="Browse files"></button>
</div>

<style>
.dropzone-shell {
  position: relative;
  min-height: 220px;
  max-height: 220px;
  overflow: hidden;
}

.browse-overlay {
  position: absolute;
  left: 50%;
  top: 168px;
  transform: translateX(-50%);
  width: 180px;
  height: 38px;
  border: 0;
  background: transparent;
  cursor: pointer;
}

:global(.filepond--root) {
  margin: 0;
  font-family: "Public Sans", "Segoe UI", sans-serif;
  height: 220px;
}

:global(.filepond--drop-label) {
  min-height: 220px;
  padding: var(--space-6);
  display: grid;
  place-items: center;
  text-align: center;
}

:global(.filepond--panel-root) {
  background:
    radial-gradient(circle at 30% 30%, color-mix(in srgb, var(--color-bg-4) 35%, transparent), transparent 55%),
    radial-gradient(circle at 70% 60%, color-mix(in srgb, var(--color-bg-3) 30%, transparent), transparent 45%),
    var(--surface-panel);
  border: 1px dashed var(--border-default);
  border-radius: var(--radius-xl);
}

:global(.filepond--label-action) {
  text-decoration: none;
}

:global(.dz-title) {
  display: block;
  font-size: 1.1rem;
  font-weight: 650;
  color: var(--text-primary);
  margin-bottom: 0.45rem;
}

:global(.dz-subtitle) {
  display: block;
  font-size: 0.84rem;
  color: var(--text-secondary);
  margin-bottom: 0.65rem;
}

:global(.dz-or) {
  display: block;
  margin-bottom: 0.45rem;
  color: var(--text-tertiary);
}

:global(.dz-browse) {
  border: 1px solid var(--border-default);
  background-color: var(--interactive-muted-bg);
  color: var(--interactive-muted-text);
  border-radius: var(--radius-lg);
  font-size: 0.9rem;
  font-weight: 600;
  padding: 0.45rem 1rem;
  cursor: pointer;
}

:global(.filepond--item-panel) {
  background-color: var(--surface-elevated);
}
</style>
