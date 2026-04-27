<script lang="ts">
// Import the Image EXIF Orientation and Image Preview plugins
// Note: These need to be installed separately
// `npm i filepond-plugin-image-preview filepond-plugin-image-exif-orientation --save`
//import FilePondPluginImageExifOrientation from 'filepond-plugin-image-exif-orientation'
//import FilePondPluginImagePreview from 'filepond-plugin-image-preview'
import FilePond, { registerPlugin, supported } from 'svelte-filepond';

// Register the plugins
// registerPlugin(FilePondPluginImageExifOrientation, FilePondPluginImagePreview);

// a reference to the component, used to call FilePond methods
let pond;

// pond.getFiles() will return the active files

// the name to use for the internal file input
let name = 'filepond';

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
		server="/api"
		allowMultiple={true}
		oninit={handleInit}
		onaddfile={handleAddFile}/>
</div>

<style>
.wrapper {
	width: 300px;
	min-height: 300px;
	border: 2px dashed #d9d9d9;
	margin: 0 auto;
}
</style>