# Generate Svelte Component

Generate a Svente 5 component `GraphDataPicker.svelte`.

It will have:

- A modal dialog that lets user create an input or output entry to the graph,
  which is a named field of a given data type.
- It lists several data types, user selects a data type, enters a name, and clicks "ADD FIELD".
- A data type can be: "Scalar", "2D Geometry", "Bitmap", "Vector", "Table" etc.
- Each data type is diplayed as a mini card. In the UI it is almost square like
  with 3 per row. But here you will reuse the component `ItemCard.svelte` with
  2 items per row. Use `ImageIcon` for icon.
- The list items are displayed in a scrollable panel.
- The modal UI should use a fixed size div as modal. It adapts to single column
  list upon window resize. Use max-width or 40% of width.
- See the image `GraphDataPicker.png` for the mocks, it shows the dialog, ignore the blurry backdrop.

- Implementing everything in one component might be complex. Re-factor these 2 areas on the UI into separate components. Keep in mind they should have clean interface and reusable.
- The title bar with the close icon button. Make it a component `DialogTitleBar.svelte`. It will have the title in strong font, and a right aligned close icon.
  The close button has a circular background visible on hover.
- The action bar below, which consists of 2 buttons: "CANCEL" and "ADD FIELD".
  Make this a component `DialogActionBar.svelte`. The cancel button will be common, the positive action bar title can be taken in props, defaults to "OK".

- So it will be total 3 components: DialogTitleBar, DialogActionBar, GraphDataPicker
- Add storybook pages for each. For `GraphDataPicker` test multiple widths.
- For title bar and action bar, test both unrestricted width and fixed width.

- Understand the requirement, analyse the image to analyze the mock, ask any question.
- Generate all the components in `src/components`
