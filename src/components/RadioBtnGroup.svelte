<script lang="ts">
import { newRandomId } from "../jsutils/idUtils";

interface Props {
  group?: string;
}

const { group }: Props = $props();

/* svelte-ignore state_referenced_locally */
const name = group ?? "radio_" + newRandomId();
</script>

<div class="radio-group txt-sm-strong">
  <label class="radio-item">
    <input type="radio" {name} value="1" checked />
    <span class="radio-ui">Opt 1</span>
  </label>

  <label class="radio-item">
    <input type="radio" {name} value="2" />
    <span class="radio-ui">Opt 2</span>
  </label>
</div>

<style>
.radio-group {
  display: inline-flex;
  border: 1px solid var(--border-subtle);
  border-radius: var(--radius-md);
  overflow: hidden;
}

.radio-group:focus-within {
  outline: 2px solid var(--color-accent);
  outline-offset: 2px;
}

.radio-item {
  cursor: pointer;
}

/* Hide native radio visually but keep it accessible */
.radio-item input[type="radio"] {
  position: absolute;
  opacity: 0;
  width: 0px;
  height: 0px;
  pointer-events: none;
}

.radio-ui {
  display: inline-block;
  padding: var(--space-2) var(--space-5);
  transition: all 0.15s ease;
}

.radio-item .radio-ui {
  font-weight: var(--font-weight-medium);
  background: var(--color-bg-1);
  color: var(--color-text-hi-con);
}

/* Hover effect */
.radio-item:hover .radio-ui {
  background: var(--color-bg-2);
}

.radio-item input[type="radio"]:checked + .radio-ui {
  background: var(--color-flip-bg-1);
  color: var(--color-flip-text-hi-con);
}

/* Focus-visible for keyboard accessibility */
.radio-item input[type="radio"]:focus-visible + .radio-ui {
  outline: 2px solid var(--color-focus-ring);
  outline-offset: 2px;
}
</style>
