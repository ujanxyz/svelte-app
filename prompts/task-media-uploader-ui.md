# Media Uploader UI

Implement a modal UI component `MediaUploader.svelte` in `src/modules/fngallery`, which will
let users upload media files (images and videos), see the list of uploaded medias (with thumbnails),
and select one from the list.

Read the image `MediaUploader.png` and analyse the mock UI. You will implement this UI.

# Requirements

- This will be invoked using the overlay (`src/modules/overlay2`) framework. So inside use an overlay instance to get the payload and settle or cancel the overlay (the modal window).

- Leave a TODO for thumbnails. For now use a random image by calling `https://i.pravatar.cc/100` every time.

- Use dummy data for the list. You can use the data in the list items in the UI mock. Emulate an api fetch, which returns the data after 0.1 sec.

- Implement the dropzone as shown in the picture. Even better yet re-factor the dropzone logic into a
  decicated component `FileDropZone.svelte` (in `src/components`).

- For the actual file upload functionality I am using the `filepond` 3rd party library. See the example use in `src/modules/sloteditor/PickFile.svelte`

- When user uploads a new media, to add to teh existing list, emulate an api call (0.1s delay) then add it to the list.

- When user selects an item in the list, settle the overlay which will close the modal.

- Each list item has a delete button (which removes the item), and an ellipsis (leave this functionality as a TODO).

- When a list item is deleted, there also call emulate an api call (0.1s delay), and remove from the list.

- Two alternate ways to view the items: list view and grid view. See the toggle buttons in the mock image. You can re-factor the UI for the list and grid items into separate components. Name them
  `MediaUploaderListItem.svelte` and `MediaUploaderGridItem.svelte`

- For the two action buttons below, ("CLOSE" and "UPLOAD") use the existing component `src/components/DialogActionBar.svelte`

- You do not have mock for the grid view, design one yourself.

- Add one thing not shown in the mock: Add a checkbox in each list items to select and delete multiple list items altogether. Then add a delete icon button between "Sort By" and the mode picker (list vs grid)

- Add storybook items for `MediaUploaderListItem.svelte`, `MediaUploaderGridItem.svelte` and the main component.
