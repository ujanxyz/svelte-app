# Build backend components for graph execution pipeline.

You are an expert JS developer and building a node based graph execution pipeline, which processes geometric and bitmap data (images and videos). The graph models execution stages as nodes, and data flows through edges which can be bitmaps.

The pipeline is executed in WebWorker, with the core execution logic in C++ WebAssembly.
The gaph editor UI (using xyflow-svelte) in the main thread communicates with the worker for every types of messages, and keep the UI updated.
The C++ logic is outside this repo, and you do not need to worry about those API implementations which goes into the wasm side.

Here we focus on the IO operations between the main thread and the worker.

- The graph has uploaded media files (image or video) as graph input nodes, which yields
  a bitmap for the subsequent nodes / stages. The input media files are stages in a database
  (WebWorker IndexedDb) which are read when the pipeline runs.
- The nodes have named inputs and outputs (called slots), which can also be bitmaps.
- Finally the graph has output / sink nodes which can be bitmaps. Those sink nodes capture the bitmaps, converts then to media files, and saves back in the same database.

Here you will implement the components: `PreviewManager`, `WorkerIndexedDb`, `IoEventsHandler`, and `WorkerIoManager`

# Use cases

These are the main use case scenarios, involving those components:

(during graph editing)

- _Create Input_ User creates an inout node in UI, with say id `N1`.
  This will create an empty media entry `/$in/<node_id>` in the internal graph state (In C++).
  This will create an register a preview canvas in the node (in UI). The canvas should show a cross due to being empty.

- _Upload Media_ User upload an image/video, but not yet linked to any node.
  This will create an entry by the filename, say `mountains.jpg` in IndexedDb.

- _Pick Media_ User picks an uploaded image/video against graph input `/$in/<node_id>`.
  Suppose the picker media is `mountains.jpg`.
  Then `WorkerIoManager` will update the entry in node state to point to the file `mountains.jpg`.
  Then `WorkerIoManager` will load the image from IndexedDb, and trigger an event `INPUT_MEDIA_UPDATED` in the event target.
  Preview manager which listens to such events, will update any registered preview.

- _Change Media_ User changes the image/video against `/$in/<node_id>`, from `mountains.jpg` to `lakes.jpg`.
  First `WorkerIoManager` will update the entry in node state.
  Then `WorkerIoManager` will load the new image (`lakes.jpg`) from IndexedDb, and trigger an event `INPUT_MEDIA_UPDATED` in the event target.
  Preview manager which listens to such events, will update any registered preview.

- _Clear Media_ User clear the image/video reference (not the actual media) against `/$in/<node_id>`
  The steps are similar to _Change Media_, except that `WorkerIoManager` triggers an `INPUT_MEDIA_UPDATED` event with an empty filename.

- _Delete Media_ User deletes one or more images/videos from the db, say `mountains.jpg`, `lakes.jpg`.
  First `WorkerIoManager` calls C++ to get the affected graph input node ids. For those node states, clear the references to the deleted files.

(during pipeline execution)

`WorkerIoManager` does these steps to execute a pipeline:

- It requests the mapping input node id -> filename. Then fetch the files into ImageData
  and trigger an `INPUT_MEDIA_REFRESHED` event which is processed similar to `INPUT_MEDIA_UPDATED`
  Then conver the ImageData to raw bitmap and fill in the slot data (in C++).
- It calls the C++ run pipeline, which executes the node steps, non-bitmap input/output nodes.
- It requests the mapping input node outputs (node ids, names).
  Post execution it already has the bitmap data in thes input slot. Io manager gets that bitmap,
  from that creates a media (png by default), and saves in the db.

# Task-1: Implement the Preview Manager

Your first task is to implemet a class `src/webworker/PreviewManager.ts`.
It is a stand alone class, no dependency.

The preview manager maintains a collection of "previews" which are offscreen controls of HTML5 canvases residing in the main (browser) UI, but the control transfered to WebWorker.
The UI thread creates small sized HTML5 canvases at various nodes to preview the bitmaps flowing through those stages, then transfers the controls as `OffscreenCanvas` to the backend along with the node and slot id. Those get registered in the `PreviewManager`.
Then when the bitmap is actually produced for that stage (at a function node, by pipeline execution), or a media file is uploaded at an input node (at a graph input node), or
a final output is saved (at a graph output node), that image or bitmap is taken and drawn
on each of the preview canvases registered against the node / input / output ids.

The apis are:

- Register a preview canvas (`OffscreenCanvas`) against a node id or slot id.
- Register a preview canvas against a graph input (node id).
- Register a preview canvas against a graph output (node id).
- Unregister by input/output id.
- Notify update in a bitmap. This is called when a function node that emits a bitmap finishes execution.
- Notify media uploaded, this is called when it is needed to update a graph input
  (e.g. the input media is uploaded or the graph is initialized from persisted data)
- A graphic and its matching preview can be registered in any order, but upon first
  insertion if a match immediately occurs, update the preview.

NOTE:

- An input/output id is simply a node id (string), a slot is is (node id + slot name).
  Node id based map key format: `/$in/<node_id>` or `/$out/<node_id>`
  Slot id based map key format: `/$slot/<node_id>:<slot_name>`, using the slot first creating the bitmap.
- The graphic can be either an imagemap or raw bitmap (raw Uint8ClampedARray), in that cased it is accompanied with the height and width.
- A preview is an `OffscreenCanvas`.
- A graphic maps to one or more preview.
- The data backing the graphic (image data or buffer) is modified outside and this class
  only receives a notification telling when to sync the matching previews.
- When a graphic is drawn on a preview canvas, use "letterboxing" algorithm, preserve the
  aspect ratio of the graphic and fit into the canvas, canter aligned, and make the blank area black. Re-factor the logic in a separate method.

# Task-2: Implement IndexedDb

Update the existing class `src/webworker/db/WorkerIndexedDb.ts` to accomodate the
db operations described here. Update the existing ops, keep the unused ones.

Supported APIs:

- List existing input media, output media
- Upload a new media file (input only). Option to overwrite.
- Delete a media file (input or output).
- Clear all output media files.
- Clear all input and output media files.

For media files it will save the creation time (original), last updated, mime type, width, height, etc.

# Task-3: Implement the IO Events Handler

The class `IoEventsHandler.ts` handles C++ events triggered from webassembly code.
It has a reference to the preview manager.

- _BITMAP_CREATED_ Called when a node creates a new bitmap.
- _BITMAP_DELETED_ Called when a bitmap is deleted
- _BITMAP_FLUSHED_ Called after a bitmap is modified
- _INPUT_MEDIA_UPDATED_ Called when an ImageData is loaded from db for an input node id.

NOTE: There is already an existing implementation of this, update in the same file.
The event `FILE_UPLOADED` can be deprecated, do not delete yet.

# Task-4: Implement the IO related logic in Worker IO Manager

In the class `WorkerIoManager.ts` (existing file) implements these apis with codes:

- CREATE_INPUT
- UPLOAD_MEDIA
- PICK_MEDIA
- CHANGE_MEDIA
- CLEAR_MEDIA
- DELETE_MEDIA

Read about these scenarios above.

# Guidelines

You are an experienced senior developer and software architect with expertise in clean robust design.
Think thoroughly about the spec described here, suggest any improvements, flesh out the specs,
mention the modifications / deletions to existing code you need to do, confirm with me,
and finally write clean readable code. For these components.

- You will read only from `src/webworker`, `src/webworkerclient`, `src/types`. The
  remaining code are UI related and might not be relevant.
