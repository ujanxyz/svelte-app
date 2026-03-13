<script lang="ts">
import { background } from 'storybook/theming';
import type { Snippet } from 'svelte';
import type { HTMLAttributes } from 'svelte/elements';

interface Props extends HTMLAttributes<HTMLDivElement> {
  children: Snippet;
  width?: number;
  height?: number;
  bgcolor?: string;
}

const { children, width, height, bgcolor, ...rest }: Props = $props();
const styleWidth = $derived(width ? `${width}px` : "100%");
const styleHeight = $derived(height ? `${height}px` : "100%");
</script>

<div class={["container", "div-columns"]} style:width={styleWidth} style:height={styleHeight} style:background-color={bgcolor} {...rest}>
  {@render children()}
</div>

<style>
.container {
  border: 1px dashed #484848;
  border-style: dashed;
  margin: auto;
}
.div-columns {
  display: flex;
  flex-direction: column;
  align-items: stretch;
}
</style>