<script lang="ts">
  import { onMount, type Snippet } from 'svelte';
  import { useOverlayProvider } from './overlayContext';
  import type { OverlayChildUse, OverlayDisplayState, OverlaySnippet } from './types';
  import clickOutside from './clickOutside';
  import useUiRegistry from './useUiRegistry';
  import type { ClassValue } from 'svelte/elements';

  const { children }: { children: Snippet } = $props();
  let overlayContainer = $state<HTMLDivElement | undefined>(undefined);

  /**
   * This controls the displayed state of overlay, as well as config data.
   */
  let displayState = $state<OverlayDisplayState | null>(null);

  /**
   * Inline style of the container nav element.
   */
  const overlayStyle: string = $derived(_toStyle(displayState));

  /**
   * The snippet which is rendered.
   */
  const overlayClazzs: ClassValue[] = $derived(_toCssClass(displayState));

  /**
   * The snippet which is rendered as overlay. The snippet render function should
   * have a prototype that accepts an instance of type `OverlayChildUse`, which
   * can be passed in child props, and later used in overlay components to close
   * the overlay.
   */
  const overlayContent: OverlaySnippet = $derived(_toSnippet(displayState));


  const {getUI: getOverlayUI} = useUiRegistry();
  const overlay = useOverlayProvider(_setDisplayState);

  onMount(() => {
    overlay.setContainer(overlayContainer as HTMLDivElement);
    return () => _hideOverlay;
  });

  function _setDisplayState(state: OverlayDisplayState | null): void {
    displayState = state;
  }

  function _hideOverlay() {
		displayState = null;
	}

  function _toStyle(state: OverlayDisplayState | null): string {
    if (state !== null) {
      if (state.mode === "ctx") {
        const leftS = (state.left as number).toFixed(1);
        const topS = (state.top as number).toFixed(1);
        return [`left:${leftS}px;`, `top:${topS}px;`].join(" ");
      }
    }
    return "";
  }

  function _toCssClass(state: OverlayDisplayState | null): ClassValue[] {
    if (state !== null) {
      if (state.mode === "top") {
        return ["overlay-top"];
      }
    }
    return [];
  }

  function _toSnippet(state: OverlayDisplayState | null): OverlaySnippet {
    if (!state) return fallbackContent;
    return getOverlayUI(state.uiName) ?? fallbackContent;
  }
</script>

{#snippet fallbackContent(overlay: OverlayChildUse)}
  No overlay content attached
{/snippet}

<div bind:this={overlayContainer} class="container" data-debug-name="xyflow">
    {@render children()}
    {#if displayState !== null}
      {@const childUse: OverlayChildUse = {close:_hideOverlay}}
      <nav class={["overlay", ...overlayClazzs]} style={overlayStyle}
  	      use:clickOutside on:clickOutside={_hideOverlay}>
        {@render overlayContent(childUse)}
      </nav>
    {/if}
</div>

<style>
.overlay {
  position: absolute;
  z-index: 100;
}
.overlay-top {
  left: 0px;
  right: 0px;
  top: 0px;
  bottom: 0px;
  margin: auto; 
  width: fit-content;
  height: fit-content;
}
.container {
  width: 100%;
  height: 100%;
  position: relative;
}
</style>
