<script lang="ts">
// Import the Image EXIF Orientation and Image Preview plugins
// Note: These need to be installed separately
// `npm i filepond-plugin-image-preview filepond-plugin-image-exif-orientation --save`
//import FilePondPluginImageExifOrientation from 'filepond-plugin-image-exif-orientation'
//import FilePondPluginImagePreview from 'filepond-plugin-image-preview'
import "filepond/dist/filepond.min.css";

import { type ActualFileObject, type ProcessServerConfigFunction, type ProgressServerConfigFunction } from 'filepond';
import { getContext } from "svelte";
import FilePond from "svelte-filepond";

import { useGraphService } from "@/graph/graph-services";
import type { GraphIoManager } from "@/webworkerclient/GraphIoManager";

const graphIo = getContext(Symbol.for("GraphIoManager")) as GraphIoManager;

// Register the plugins
// registerPlugin(FilePondPluginImageExifOrientation, FilePondPluginImagePreview);

// a reference to the component, used to call FilePond methods
let pond: any;

// pond.getFiles() will return the active files

// the name to use for the internal file input
let name = 'filepond';


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

	graphIo.uploadFile(fileObj)
		.then(() => {
			console.log("File uploaded successfully");
			load("f001");
		})
		.catch((e) => {
			console.error("Error uploading file: ", e);
			error("Error: " + e.message);
		});

	progress(false, 100, 100);
	// error("Error foo");
	load("f001");
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