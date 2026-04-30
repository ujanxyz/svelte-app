# Refactor Plan: Design Token Migration

## 1. The Goal

Replace hardcoded hex codes, pixel values, and literal color names with CSS variables from `src/app/styles/tokens.css`.

## 2. Mapping Table (Source -> Token)

| Category | Hardcoded Value    | CSS Variable             |
| :------- | :----------------- | :----------------------- |
| Colors   | `#ffffff`, `white` | `var(--color-bg-0)`      |
| Colors   | `#1a1a1a`, `black` | `var(--color-flip-bg-0)` |
| Spacing  | `8px`, `0.5rem`    | `var(--space-3)`         |
| Spacing  | `16px`, `1rem`     | `var(--space-6)`         |
| Radius   | `4px`              | `var(--radius-md)`       |

## 3. Implementation Rules

- **Scope**: Only modify `<style>` blocks in Svelte files.
- **Precision**: If a value is close (e.g., `15px`), use the nearest token (`16px/--space-medium`).
- **Cleanup**: If a style block becomes empty after refactoring (unlikely but possible), leave it for now.
