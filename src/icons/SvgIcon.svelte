<script lang="ts">
    import { getIconPath } from "./getIconPath";

  const size = 256;

  interface Props {
    icon: string;  
  }

  const { icon }: Props = $props();
  const path: string = getIconPath(icon);
</script>


<svg xmlns="http://www.w3.org/2000/svg" role="img" class="ico" viewBox="0 0 {`${size}`} {`${size}`}"
    fill="none" stroke-linecap="round" stroke-linejoin="round" clip-rule="evenodd" >
    <path d={path}/>
</svg>

<style>
svg {
  width: var(--comp-svg-icon-sz);
  height: var(--comp-svg-icon-sz);
  fill: currentColor;
  overflow: hidden;
  stroke: yellow;
  stroke-width: 2px;
  /* stroke: currentcolor;
  stroke-width: var(--stroke-width, 1.2); */
}
</style>