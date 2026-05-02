# App Design Tokens

This directory now contains a basic but production-friendly token setup.
The goal is to move from ad hoc variables to a layered system similar to what professional design agencies ship.

## What is already good in your original version

1. You defined scale-based typography, spacing, radius, shadows.
2. You already separated light and dark values.
3. You started with a real brand palette instead of generic blue defaults.

## Where to improve (industry-standard comparison)

High-end teams usually apply these standards:

1. **Layered token architecture**
   - Primitive/foundation tokens (raw scales)
   - Brand tokens (brand colors and ramps)
   - Theme tokens (light/dark mappings)
   - Semantic tokens (component-facing aliases)

2. **Semantic naming over raw naming in components**
   - Prefer `--text-primary` instead of directly using `--color-text-hi-con` in component CSS.

3. **Predictable scales**
   - Keep spacing and typography on a clear scale to avoid one-off values.

4. **Interaction states as tokens**
   - Hover, focus ring, selected, danger should be tokenized, not hardcoded per component.

5. **Theme switch strategy**
   - Dark mode on `:root` and explicit light override with `[data-theme='light']`.

## Files in this folder

- `tokens.css`
  - Imports all token files in order.
- `tokens.foundation.css`
  - Raw scales: spacing, typography, shadows, radius.
- `tokens.brand.css`
  - Brand palette and derived ramps.
- `tokens.theme.css`
  - Light and dark theme mappings.
- `tokens.semantic.css`
  - Component-facing semantic aliases.

## How to use

Import once in your global app stylesheet or entry stylesheet:

```css
@import "./styles/tokens.css";
```

Then build component styles from semantic tokens:

```css
.button-primary {
  background: var(--interactive-primary-bg);
  color: var(--interactive-primary-text);
  border: 1px solid var(--border-default);
  border-radius: var(--radius-md);
  box-shadow: var(--shadow-sm);
  padding: var(--space-3) var(--space-6);
}

.button-primary:hover {
  background: var(--interactive-primary-bg-hover);
}

.button-primary:focus-visible {
  box-shadow: var(--focus-ring);
}
```

## Component examples

### 1) Buttons: plain / muted / accent

```css
.btn-plain {
  background: transparent;
  color: var(--text-primary);
  border: 1px solid var(--border-default);
}

.btn-muted {
  background: var(--interactive-muted-bg);
  color: var(--interactive-muted-text);
  border: 1px solid var(--border-subtle);
}

.btn-muted:hover {
  background: var(--interactive-muted-bg-hover);
}

.btn-accent {
  background: var(--interactive-accent-bg);
  color: var(--interactive-accent-text);
  border: 1px solid
    color-mix(in srgb, var(--interactive-accent-text) 25%, transparent);
}

.btn-accent:hover {
  background: var(--interactive-accent-bg-hover);
}
```

### 2) Menu/List item: plain / selected

```css
.menu-item {
  background: transparent;
  color: var(--text-secondary);
  border: 1px solid transparent;
}

.menu-item:hover {
  background: var(--surface-panel);
  color: var(--text-primary);
}

.menu-item[aria-selected="true"] {
  background: var(--surface-elevated);
  color: var(--text-primary);
  border-color: var(--border-default);
}
```

## Next quality upgrades to reach agency-level maturity

1. Add a documented typography system per role:
   - `--type-label-sm-size`, `--type-body-md-size`, `--type-title-lg-size`, and matching line-height/weight tokens.
2. Add state tokens for validation/success/warning/info.
3. Add motion tokens:
   - `--motion-fast`, `--motion-standard`, `--easing-standard`.
4. Add elevation semantics:
   - `--elevation-raised`, `--elevation-overlay` aliases on top of raw shadows.
5. Add contrast checks for all text/background pairings and keep AA minimum as baseline.

This setup is intentionally still simple, but it now follows a scalable token model and is ready to standardize your app styles.

## Token Audit Workflow

Use the checklist in `TOKEN_AUDIT_CHECKLIST.md` as a merge gate for any UI style change.
It helps enforce semantic token usage and prevent visual drift.
