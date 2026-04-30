# Token Audit Checklist

Use this checklist before merging any new UI component or style refactor.

## Scope

- Component styles (Svelte component style blocks, CSS modules, shared stylesheets)
- New or edited interactive states
- Any new color, spacing, typography, radius, elevation, or motion values

## Quick Gate (must pass)

1. No hardcoded color values in component CSS (`#`, `rgb`, `hsl`) unless in token files.
2. No direct use of primitive theme variables in components when a semantic token exists.
3. No one-off spacing/radius/shadow values outside token scales.
4. Focus-visible state is present for keyboard-accessible controls.
5. Light and dark themes both render correctly for changed UI.

## Naming Rules

1. Foundation tokens are raw scales only.
2. Brand tokens represent palette and ramps only.
3. Theme tokens map palette values per mode.
4. Semantic tokens are the only tokens components should consume.
5. Token names should be role-based, not component-specific, unless intentionally scoped.

## Audit Questions

1. Color and Contrast

- Is text/background contrast at least WCAG AA for regular text?
- Are error/success/warning/info states tokenized rather than hardcoded?
- Are borders and separators using semantic border tokens?

2. Typography

- Are font size, line height, and weight from token scales?
- Are typographic roles consistent (label/body/title/caption)?

3. Spacing and Layout

- Are margins/padding/gaps from spacing tokens only?
- Is layout rhythm consistent across sibling components?

4. State and Interaction

- Are hover, active, selected, disabled, and focus-visible states tokenized?
- Is focus style visible on both light and dark backgrounds?

5. Elevation and Surfaces

- Are surfaces using semantic surface tokens?
- Are shadows/elevation levels consistent with intent?

6. Theme Safety

- Does the component avoid assumptions about fixed background or text colors?
- Does it remain readable in both light and dark themes?

## Allowed Exceptions

Document every exception in the PR description with reason and cleanup plan.

- Third-party CSS override constraints
- Browser compatibility fallback constraints
- Temporary migration gaps (must include follow-up issue)

## Suggested PR Checklist Snippet

Copy this into PRs that touch UI styles:

- [ ] No hardcoded visual values outside token files
- [ ] Semantic tokens used in component styles
- [ ] Keyboard focus-visible state verified
- [ ] Light and dark theme checked
- [ ] Contrast checked for changed text/background pairs
- [ ] Any exceptions documented with follow-up plan

## Quarterly Token Health Review

1. Count one-off values introduced since last review.
2. Promote repeated one-off values into semantic tokens.
3. Remove unused tokens and merge duplicates.
4. Verify contrast for all primary text/surface pairings.
5. Review token naming drift and standardize aliases.
