<script module lang="ts">
import { defineMeta } from "@storybook/addon-svelte-csf";
import ArrowSquareOutIcon from "phosphor-svelte/lib/ArrowSquareOutIcon";

import FadingPanel from "./FadingPanel.svelte";

const { Story } = defineMeta({
  title: "Components/FadingPanel",
  component: FadingPanel,
  tags: ["autodocs"],
  args: {},
});
</script>

<Story name="Center With Shadow Button">
  {#snippet template()}
    <div style="position: relative; width: 240px; height: 180px; border: 1px solid var(--color-border-subtle); border-radius: 10px; background: linear-gradient(135deg, var(--color-bg-2), var(--color-bg-1)); overflow: hidden;">
      <FadingPanel className="demo-center">
        <button class="demo-zoom-btn" type="button" aria-label="Open image viewer">
          <ArrowSquareOutIcon size={16} weight="bold" />
        </button>
      </FadingPanel>
    </div>
  {/snippet}
</Story>

<Story name="Bottom Center Action Bar">
  {#snippet template()}
    <div style="position: relative; width: 420px; height: 220px; border: 1px solid var(--color-border-subtle); border-radius: 10px; background: var(--color-bg-0); overflow: hidden;">
      <FadingPanel className="demo-bottom">
        <div class="demo-action-bar" role="toolbar" aria-label="Image actions">
          <button class="demo-action-btn" type="button">-</button>
          <button class="demo-action-btn" type="button">Fit</button>
          <button class="demo-action-btn" type="button">1:1</button>
          <button class="demo-action-btn" type="button">+</button>
          <span class="demo-divider"></span>
          <button class="demo-action-btn" type="button">x</button>
        </div>
      </FadingPanel>
    </div>
  {/snippet}
</Story>

<Story name="Top Right Corner">
  {#snippet template()}
    <div style="position: relative; width: 280px; height: 180px; border: 1px solid var(--color-border-subtle); border-radius: 10px; background: var(--color-bg-1); overflow: hidden;">
      <FadingPanel className="demo-top-right">
        <div class="demo-pill">LIVE</div>
      </FadingPanel>
    </div>
  {/snippet}
</Story>

<style>
/* Use :global because these classes are applied to FadingPanel's root element rendered in another component. */
:global(.demo-center) {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
}

.demo-zoom-btn {
  width: 2.1rem;
  height: 2.1rem;
  border-radius: 999px;
  border: 1px solid var(--color-border-default);
  background: color-mix(in srgb, var(--color-bg-0) 75%, transparent);
  color: var(--color-text-hi-con);
  box-shadow: 0 4px 14px color-mix(in srgb, var(--color-flip-bg-0) 45%, transparent);
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

:global(.demo-bottom) {
  position: absolute;
  left: 50%;
  bottom: 0.9rem;
  transform: translateX(-50%);
}

.demo-action-bar {
  display: flex;
  align-items: center;
  gap: 0.35rem;
  padding: 0.35rem 0.65rem;
  border: 1px solid var(--color-border-subtle);
  border-radius: 999px;
  background: color-mix(in srgb, var(--color-bg-0) 70%, transparent);
  box-shadow: 0 2px 10px color-mix(in srgb, var(--color-flip-bg-0) 40%, transparent);
}

.demo-action-btn {
  border: 0;
  border-radius: 999px;
  min-width: 1.65rem;
  height: 1.65rem;
  padding: 0 0.4rem;
  background: transparent;
  color: var(--color-text-hi-con);
}

.demo-divider {
  width: 1px;
  height: 1rem;
  background: var(--color-border-default);
  opacity: 0.45;
}

:global(.demo-top-right) {
  position: absolute;
  top: 0.6rem;
  right: 0.6rem;
}

.demo-pill {
  border: 1px solid var(--color-border-default);
  border-radius: 999px;
  padding: 0.2rem 0.5rem;
  font-size: 0.68rem;
  font-weight: 700;
  letter-spacing: 0.06em;
  color: var(--color-text-hi-con);
  background: color-mix(in srgb, var(--color-bg-0) 70%, transparent);
}
</style>
