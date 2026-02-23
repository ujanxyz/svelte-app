<script lang="ts">
  import PopupGallery from '../overlay/PopupGallery.svelte';
  import { type OverlayChildUse } from '../overlay/types';
  import useUiRegistry from '../overlay/useUiRegistry';
  import FunctionGallery from './FunctionGallery.svelte';

  const { registerUI } = useUiRegistry();
  registerUI("func", funcGallery);

</script>

{#snippet funcGallery(overlayUse: OverlayChildUse)}
  <PopupGallery {overlayUse}>
    <FunctionGallery {overlayUse} />
  </PopupGallery>
{/snippet}

<!-- No HTML template, everything via UI registration above -->
