# Worker IndexedDB Store Spec

## Goal

Provide a web-worker-local storage layer for pipeline media and binary assets using IndexedDB.

## Functional Requirements

- Store files by filename.
- Reject writes when filename already exists.
- Support binary and image content.
- List stored files with type metadata.
- Read file content as Blob.
- Read image content as ImageBitmap.
  - Throw if the file is not an image.
- Delete files by filename.

## Implementation Requirements

- Use the idb library.
- Expose a stateful ES class API.
- Open the DB lazily and reuse the same connection for subsequent calls.
- Auto-close the DB connection after inactivity.
  - Idle timeout: 60 seconds.

## Worker Integration Requirements

The main worker IO layer should expose command handlers for:

- SEND_FILE
- LIST_FILES
- GET_FILE_BLOB
- GET_FILE_IMAGE_BITMAP
- DELETE_FILE

The command layer returns serializable payloads. ImageBitmap responses must be posted with transferables.
