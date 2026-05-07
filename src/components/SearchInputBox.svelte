<script lang="ts">
import { getAppIcon } from "@/utils/appIcons";

interface Props {
  placeholder: string;
  onUpdateText: (text: string) => void;
  class?: string;
  outerClass?: string;
}

const {
  placeholder,
  onUpdateText,
  class: className = "",
  outerClass = "",
}: Props = $props();

const SearchIcon = getAppIcon("magnifying-glass");

function handleInput(ev: Event): void {
  const target = ev.currentTarget as HTMLInputElement;
  onUpdateText(target.value);
}
</script>

<div class={["search-input-outer", outerClass]}>
  <label class={["search-input-root", className]}>
    <span class="search-icon" aria-hidden="true">
      <SearchIcon size={16} weight="regular" />
    </span>
    <input
      type="text"
      class="search-input"
      placeholder={placeholder}
      oninput={handleInput}
    />
  </label>
</div>

<style>
.search-input-outer {
  width: fit-content;
}

.search-input-root {
  position: relative;
  display: inline-flex;
  align-items: center;
  width: 250px;
  height: 32px;
}

.search-icon {
  position: absolute;
  left: 10px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  color: var(--color-text-md-con);
  pointer-events: none;
}

.search-input {
  width: 100%;
  height: 100%;
  box-sizing: border-box;
  padding: 0 12px 0 34px;
  border: 1px solid var(--border-strong);
  border-radius: var(--radius-md);
  background: var(--surface-panel);
  color: var(--text-primary);
  font-size: 0.92rem;
  font-style: italic;
}

.search-input::placeholder {
  color: var(--color-text-lo-con);
}

.search-input:focus-visible {
  outline: 2px solid var(--color-accent);
  outline-offset: 2px;
}
</style>