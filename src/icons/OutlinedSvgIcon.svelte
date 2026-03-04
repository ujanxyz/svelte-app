<script lang="ts">
  import IconCodes from "./IconCodes";
  import SvgIcon from "./SvgIcon.svelte";

  const size = 24;
</script>

<span class="rounded-sm">
  <SvgIcon icon={IconCodes.HORSE} />
</span>

<style>
span {
    --comp-svg-icon-sz: 1.2rem;

    width: calc(var(--comp-svg-icon-sz) + var(--space-1));
    height: calc(var(--comp-svg-icon-sz) + var(--space-1));
    padding: calc(var(--space-1) * 0.5);
    outline: transparent;
    display: inline-flex;
    justify-content: center;
    align-items: center;
}
svg.ico {
    width: var(--comp-svg-icon-sz);
    height: var(--comp-svg-icon-sz);
    fill: none;
    overflow-clip-margin: content-box;
    overflow: hidden;
    stroke-opacity: 0.8;
    stroke: currentcolor;
    stroke-width: var(--stroke-width, 1.2);
}
</style>