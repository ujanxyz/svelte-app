<script lang="ts">
import OverlayProvider from '@/overlay/OverlayProvider.svelte';
import type { Snippet } from 'svelte';
import type { HTMLAttributes } from 'svelte/elements';

interface Props extends HTMLAttributes<HTMLDivElement> {
  children: Snippet;
  bgcolor?: string;
}

const { children, bgcolor, ...rest }: Props = $props();
</script>

<OverlayProvider>
  In pregress:
  <div class={["container"]} style:background-color={bgcolor} {...rest} data-debug-name="centered-in-overlay">
    {@render children()}
  </div>
</OverlayProvider>

<style>
.container {
  width:100%;
  height: 100%;
  text-align: center;
  vertical-align: middle;
  border: 1px dashed #484848;
}
</style>