<script lang="ts">
// Import the Image EXIF Orientation and Image Preview plugins
// Note: These need to be installed separately
// `npm i filepond-plugin-image-preview filepond-plugin-image-exif-orientation --save`
//import FilePondPluginImageExifOrientation from 'filepond-plugin-image-exif-orientation'
//import FilePondPluginImagePreview from 'filepond-plugin-image-preview'
import "filepond/dist/filepond.min.css";

import { type ActualFileObject, type ProcessServerConfigFunction, type ProgressServerConfigFunction } from 'filepond';
import { getContext, onMount } from "svelte";
import FilePond from "svelte-filepond";

import { useGraphService } from "@/graph/graph-services";
import type { plstate } from "@/types/plstate";
import type { GraphIoManager } from "@/webworkerclient/GraphIoManager";

interface Props {
  initial: plstate.EncodedData | null;
  onData: (edited: plstate.EncodedData) => void;
}

interface FileInfo {
  fname: string;
}

const { initial, onData }: Props = $props();

const graphIo = getContext(Symbol.for("GraphIoManager")) as GraphIoManager;

// Register the plugins
// registerPlugin(FilePondPluginImageExifOrientation, FilePondPluginImagePreview);

// a reference to the component, used to call FilePond methods
let pond: any;

// pond.getFiles() will return the active files

// the name to use for the internal file input
let name = 'filepond';

let fileValue = $state<FileInfo>({fname: ""});

let ondataUpdateTimeoutId: ReturnType<typeof setTimeout> | null = null;

onMount(parseInitialIoData);

function processFile(
		fieldName: string,
		file: ActualFileObject,
		metadata: { [key: string]: any },
		load: (p: string | { [key: string]: any }) => void,
		error: (errorText: string) => void,
		progress: ProgressServerConfigFunction,
		abort: () => void
	): void {
	console.log("Processing file...", arguments);

	const fileObj: File = file as File;

	progress(false, 0, 100);
	graphIo.uploadFile(fileObj)
		.then(() => {
			console.log("File uploaded successfully: ", fileObj);
			progress(false, 100, 100);
			load("f001");
			const data: plstate.EncodedData = {
				payload: JSON.stringify({ fname: fileObj.name }),
			};
			scheduleOndataUpdate(data);
		})
		.catch((e) => {
			console.error("Error uploading file: ", e);
			error("Error: " + e.message);
		});
}

const server = {
	// source is the current file being processed, use this to a reference
	// to the file on your server and let FilePond know the URL
	process: processFile as ProcessServerConfigFunction,
};

// handle filepond events
function handleInit() {
	console.log('FilePond has initialised');
}

function handleAddFile(err: any, fileItem: File) {
	console.log('A file has been added', fileItem);
}

// Call onData after 0.1 seconds, also cancel any previously scheduled timeout.
function scheduleOndataUpdate(data: plstate.EncodedData): void {
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
  const fileInfo = parsed as FileInfo;
	if (typeof fileInfo.fname !== "string") {
		console.warn("Invalid initial data for PickFile: ", initial);
		return;
	}
  fileValue = fileInfo;
}

</script>

<div class="wrapper">
<FilePond bind:this={pond} {name}
    labelIdle="foo"
		server={server}
		allowMultiple={true}
		credits={false}
		oninit={handleInit}
		onaddfile={handleAddFile}/>
</div>

<style>
.wrapper {
	width: 300px;
	margin: 0 auto;
	height: fit-content;
}
:global(.filepond--root) {
	background-color: rgba(127, 255, 212, 0.124);
}
:global(.filepond--drop-label) {
}
</style>