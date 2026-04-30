# Style Demos

This folder contains a token visualization playground component:

- `StyleDemosMain.svelte`

## Purpose

`StyleDemosMain.svelte` provides a practical side-by-side view of design token combinations so you can quickly decide which token pairings are visually strong and readable.

## What It Demonstrates

1. Typography matrix (`M x N`)
- Rows: font-size tokens
- Columns: font-weight tokens
- Includes realistic content and controls in each cell

2. Foreground/background matrix (`M x N`)
- Rows: surface/background tokens
- Columns: text tokens
- Each cell contains paragraph text, filled input, and button

3. Brand usage matrix (`M x N`)
- Rows: brand background tokens
- Columns: foreground token options
- Cell UI sample switches between buttons, inputs, and cards

4. Interactive dimensions via radio controls
- Theme: light/dark
- Line-height: tight/normal/loose
- Brand sample mode: buttons/inputs/cards

## Layout and Scrolling

The entire demo content is wrapped in a scrollable viewport.

- Vertical scroll: enabled for long pages
- Horizontal scroll: enabled when wide matrix content exceeds available width

This keeps the demo usable even with large comparison tables and smaller host containers.
