# Task 1: Collapsible side bar

As always, follow these guidelines for implementing a new component:

- Reuse design tokens from `src/app/styles`, keep all color theme neutral
  i.e. they should take different absolute value based on the active theme.
- Add storybook page next to the component, add 2-3 stories which demonstrate different edge cases.
- Use minimal props fields.
- Use minimal reactive fields. When possible combine multiple related values
  into a single state rune of object type, and use `$state.raw`. For example if you
  have an `(x, y)` pair, use a single value `$state.raw<{x: number, y: number}>({x: 0, y: 0})`
- For all icons, use `src/utils/appIcons.ts`. If the appropriate icon is not found there, ask for it, and after user confirming which phosphor-icon to use, if it's not there add the new icon in that file, keeping the list sorted as it is currently maintained. Icons are passed around in props as texts.

#-------------------------------------------------------------------------------------

Re-factor the chip functionality into a separate and reusable component, name
`TextIconPill.svelte` place in `src/components`
It will be a text field, followed by an optional icon. The icon prop should be:
`icon?: string` referring to icon name in `appIcons.ts`.

- If an icon is used, add a separator
  of subtle color between them. For consistency see `src/features/func-gallery/ParamChip.svelte`

- In prop also take an optional onClick param, used when user clicks the chip. If an `onClick`
  is provided then the whole chip is clickable (use HTML button), not just the icon, otherwise
  it is not clickable use HTML span.

As always, follow these common guidelines for implementing a new component:

- Reuse design tokens from `src/app/styles`, keep all color theme neutral
  i.e. they should take different absolute value based on the active theme.
- Add storybook page next to the component, add 2-3 stories which demonstrate different edge cases.
- Use minimal props fields.
- Use minimal reactive fields. When possible combine multiple related values
  into a single state rune of object type, and use `$state.raw`. For example if you
  have an `(x, y)` pair, use a single value `$state.raw<{x: number, y: number}>({x: 0, y: 0})`
- For all icons, use `src/utils/appIcons.ts`. If the appropriate icon is not found there, ask for it, and after user confirming which phosphor-icon to use, if it's not there add the new icon in that file, keeping the list sorted as it is currently maintained. Icons are passed around in props as texts.
