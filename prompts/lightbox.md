# Lightbox like Image Viewer

You are a experienced FE developer and you will develop a component `ImageViewer`
for a image viewer similar to lightbox.

This component takes a string id in props, and open a large window to view an image.

- The image will be received as an ImageBitmap in memory. The rendered part is a resizable canvas.
  The image will be drawn on the canvas, centered and keeping aspect ratio preserved.

- It has a floating action bar (bottom center, leaving 2rem margin) over the image visible on
  mouse activity over the image, and gradually fades on inactivity. The floating menu has buttons for:

1. Close the modal
2. zoom in, zoom out, fit to view, revert to original scale.

- It also has a small panel (always visible) to show minimal info about the media, at the top center. Fields: Name / id of the image, dimension, size (in bytes), format (png / jpg). Semi transparent blurred background.
  Dark theme => White text on Black (20% opacity)
  Light theme => Black text on White (20% opacity)

- In zoomed in state, user can pan and move the image. In zoomed out, use a checkered bg. Use the image as background (repeat X, Y)
  `public/images/CheckerBoardSeemlessPattern.jpg`

- User can resize the window, accordingly the canvas will be resized, but the image will have the aspect ratio preserved.

- The modal UI is simply a canvas taking the size of the image, and really nothing else on left, right, top, bottom of it. Except a 2 px solid border. Use elevation shadow, rounded corners.
  The controls (info banner and floating action bar) are semi-transparent overlays on the displayed image.

- Support mouse wheel event: zoom in/out.
- Support keyboard events: Esc, left, right, up, down for moving (in zoom in state)

- The canvas rendering uses aspect ratio calculation, which might have some duplicate logic with `src/webworker/PreviewManager.ts`. If that helps code deduping, extract the common logic in `src/utils/canvasUtils.ts`

- Add several storybook stories.

Design the UI window mock image, upscaled high resolution UI mock with dummy image.
Implement in `src/modules/imgviewer`.
