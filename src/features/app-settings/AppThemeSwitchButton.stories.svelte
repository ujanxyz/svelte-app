<script module lang="ts">
import { defineMeta } from "@storybook/addon-svelte-csf";

import AppThemeSwitchButton from "./AppThemeSwitchButton.svelte";

const { Story } = defineMeta({
  title: "Features/app-settings/AppThemeSwitchButton",
  component: AppThemeSwitchButton,
  tags: ["autodocs"],
  args: {
    storyThemeMode: "detect" as "detect" | "light" | "dark",
  },
});
</script>

<script lang="ts">
import { useAppSettings } from "./useAppSettings.svelte";

type StoryThemeMode = "detect" | "light" | "dark";

const { setAppTheme } = useAppSettings();

function applyStoryTheme(mode: StoryThemeMode): null {
  if (mode === "light" || mode === "dark") {
    setAppTheme(mode);
    return null;
  }

  if (typeof window !== "undefined" && typeof window.matchMedia === "function") {
    setAppTheme(window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light");
  } else {
    setAppTheme("light");
  }

  return null;
}
</script>

<Story name="Detects System Theme" args={{ storyThemeMode: "detect" }}>
  {#snippet template(args)}
    {@const _ = applyStoryTheme(args.storyThemeMode)}
    <div style="padding: 1rem; display: inline-flex; border: 1px solid var(--color-border-subtle); border-radius: 8px; background: var(--color-bg-0);">
      <AppThemeSwitchButton />
    </div>
  {/snippet}
</Story>

<Story name="Light Theme" args={{ storyThemeMode: "light" }}>
  {#snippet template(args)}
    {@const _ = applyStoryTheme(args.storyThemeMode)}
    <div style="padding: 1rem; display: inline-flex; border: 1px solid var(--color-border-subtle); border-radius: 8px; background: var(--color-bg-0);">
      <AppThemeSwitchButton />
    </div>
  {/snippet}
</Story>

<Story name="Dark Theme" args={{ storyThemeMode: "dark" }}>
  {#snippet template(args)}
    {@const _ = applyStoryTheme(args.storyThemeMode)}
    <div style="padding: 1rem; display: inline-flex; border: 1px solid var(--color-border-subtle); border-radius: 8px; background: var(--color-bg-0);">
      <AppThemeSwitchButton />
    </div>
  {/snippet}
</Story>
