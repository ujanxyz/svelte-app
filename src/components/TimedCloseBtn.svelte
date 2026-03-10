<script lang="ts">
import XIcon from "phosphor-svelte/lib/XIcon";

interface Props {
  iconSize: number;
  color: string;
  onClose: (ev: MouseEvent) => void;
}

let { iconSize, color = "red", onClose }: Props = $props();

interface ComputedPaths {
  filledPath: string;
  strokePath: string;
}

const cx = 128;
const cy = 128;
const r = 120;

let progress = $state(1.0);
const path = $derived<ComputedPaths | null>(toSvgPath(progress));

export function setProgress(value: number) {
  progress = value;
}

function toSvgPath(t: number): ComputedPaths | null {
  const fract = Math.max(0, Math.min(1, t));
  if (fract <= 0) return null;
  else if (fract >= 1) {
    const filledPath = `M ${cx} ${cy} m -${r},0  a ${r},${r} 0 1,0 ${r * 2},0 a ${r},${r} 0 1,0 -${r * 2},0`;
    const strokePath = filledPath;
    return { filledPath, strokePath };
  }
  const angle = fract * Math.PI * 2 - Math.PI / 2;
  const start = polarToCartesian(cx, cy, r, -Math.PI / 2);
  const end = polarToCartesian(cx, cy, r, angle);
  const largeArc = fract > 0.5 ? 1 : 0;
  const filledPath = `M ${cx} ${cy} L ${start.x} ${start.y} A ${r} ${r} 0 ${largeArc} 1 ${end.x} ${end.y} Z`;
  const strokePath = `M ${start.x} ${start.y} A ${r} ${r} 0 ${largeArc} 1 ${end.x} ${end.y}`;
  return { filledPath, strokePath };
}

function polarToCartesian(cx: number, cy: number, r: number, angle: number) {
  return {
    x: cx + r * Math.cos(angle),
    y: cy + r * Math.sin(angle),
  };
}
</script>

<button
  class="actionbtn"
  onclick={onClose}
  style="--icon-size: {iconSize}px; --icon-color: {color}"
>
  {@render animatedBgSvg()}
  <div class="icon">
    <XIcon size={iconSize} {color} weight="bold" />
  </div>
</button>

{#snippet animatedBgSvg()}
  <svg
    xmlns="http://www.w3.org/2000/svg"
    role="img"
    preserveAspectRatio="true"
    fill="currentColor"
    viewBox="0 0 256 256"
    class="bgarc"
  >
    <circle cx="128" cy="128" r="120" fill="transparent" />
    {#if !!path}
      {@const { filledPath, strokePath } = path}
      <path d={filledPath} class="fillarc" />
      <path d={strokePath} class="stroke" />
    {/if}
  </svg>
{/snippet}

<style>
.actionbtn {
  --icon-pad: calc(var(--icon-size) * 0.3);

  box-sizing: border-box;
  background-color: var(--color-bg-1);
  color: var(--color-border-strong);
  border-radius: 50%;
  height: calc(var(--icon-size) + 2 * var(--icon-pad));
  width: calc(var(--icon-size) + 2 * var(--icon-pad));
  padding: var(--icon-pad);
  cursor: pointer;
  position: relative;
}

.icon {
  display: block;
  position: absolute;
  left: 0;
  right: 0;
  top: 0;
  bottom: 0;
  padding: var(--icon-pad);
}
.bgarc {
  position: absolute;
  left: 0;
  right: 0;
  top: 0;
  bottom: 0;
}
.fillarc {
  fill: var(--color-bg-4);
}
.actionbtn:hover .fillarc {
  fill: var(--icon-color);
}

.stroke {
  stroke: var(--icon-color);
  stroke-width: 16;
  fill: none;
}
</style>
