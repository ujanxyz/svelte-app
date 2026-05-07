<script lang="ts">
import { getAppIcon } from "@/utils/appIcons";

import { useAppSettings } from "./useAppSettings.svelte";

const SunIcon = getAppIcon("sun");
const MoonIcon = getAppIcon("moon");

const { isDarkTheme, toggleAppTheme } = useAppSettings();
</script>

<button
  class="theme-switch"
  onclick={toggleAppTheme}
  title={$isDarkTheme ? "Light Theme" : "Dark Theme"}
  aria-label={$isDarkTheme ? "Light Theme" : "Dark Theme"}
>
  {#if $isDarkTheme}
    <SunIcon size={16} />
  {:else}
    <MoonIcon size={16} />
  {/if}
</button>

<style>
.theme-switch {
  width: 2rem;
  height: 2rem;
  background: var(--color-flip-bg-2);
  color: var(--color-flip-text-hi-con);
  border-radius: var(--radius-md);
  border: 1px solid var(--color-border-subtle);
  display: inline-flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: background-color 0.12s ease, border-color 0.12s ease;
}

.theme-switch:hover {
  background: var(--color-flip-bg-3);
}

.theme-switch:focus-visible {
  outline: 2px solid var(--color-accent);
  outline-offset: 2px;
}
</style>
