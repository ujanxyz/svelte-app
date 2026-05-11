# Task 1: Collapsible side bar

---

As always, follow these guidelines for implementing a new component:

- Reuse design tokens from `src/app/styles`, keep all color theme neutral
  i.e. they should take different absolute value based on the active theme.
- Add storybook page next to the component, add 2-3 stories which demonstrate different edge cases.
- Use minimal props fields.
- Use minimal reactive fields. When possible combine multiple related values
  into a single state rune of object type, and use `$state.raw`. For example if you
  have an `(x, y)` pair, use a single value `$state.raw<{x: number, y: number}>({x: 0, y: 0})`
- For all icons, use `src/utils/appIcons.ts`. If the appropriate icon is not found there, ask for it, and after user confirming which phosphor-icon to use, if it's not there add the new icon in that file, keeping the list sorted as it is currently maintained. Icons are passed around in props as texts.

---

Implement `localstorage` based persistence for (1) graph data (2) App settings.

- Review the partial / abandoned implementation in `src/graph/data/ManageGraphIO.svelte`. You'll re-implement this.
- Like before keep it guarded by `import.meta.env.VITE_FLAG_ENABLE_LOCAL_STORAGE`
- Replace the current api use. For graph state, use `encodeGraph` and `decodeGraph` in `src/webworkerclient/PipelineBuilder.ts`. Those should let user encode and decode the
  current state as JSON encoded string coming from webworker and WASM.
- During loading of the app it should detect any previously saved settings (assuming the feature is enabled), and graph state. When user clicks the right button in XYMenu, it should save the state.
- Design a auto-save feature and implement it. It should auto-save at every 10 sec interval. Guard this functionality behind another new vite flag: `VITE_FLAG_ENABLE_LOCAL_STORAGE_AUTOSAVE`. User might have a detailed graph saved, and not want to delete it by mistake.
- Define the app settings inside `src/features/app-settings`. Currently it has only `theme` as light or dark. Upon loading it should update the state. The localstorage reader should save the app settings there. Also it should subscribe to theme change
  and read-modify-write the current settings, with the updated theme.
