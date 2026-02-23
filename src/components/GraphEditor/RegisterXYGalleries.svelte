<script lang="ts">
  import PopupGallery from '../overlay/PopupGallery.svelte';
  import { type OverlayChildUse } from '../overlay/types';
  import useUiRegistry from '../overlay/useUiRegistry';
  import { OverlayTriggers } from './constants';
  import FunctionGallery from './FunctionGallery.svelte';

  const { registerUI } = useUiRegistry();
  registerUI(OverlayTriggers.GALLERY_POPUP, funcGallery);

</script>

{#snippet funcGallery(overlayUse: OverlayChildUse)}
  <PopupGallery {overlayUse}>
    <FunctionGallery {overlayUse} />
  </PopupGallery>
{/snippet}

<!-- No HTML template, everything via UI registration above -->
