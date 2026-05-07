<script module lang="ts">
import type { AppIconCode } from "@/utils/appIcons";

const kDtypeToIcon: Record<string, AppIconCode> = {
	points2d: "shapes",
	bitmap: "image-square",
	floats: "list-numbers",
};

export type AccessType = "I" | "O" | "M";
</script>

<script lang="ts">
import type { Component } from "svelte";

import { getAppIcon } from "@/utils/appIcons";

interface Props {
	name: string;
	dtype: string;
	access: AccessType;
	chipClass?: string;
}

const {
	name,
	dtype,
	access,
	chipClass = "",
}: Props = $props();

const accessClass = $derived(`chip-${access}`);
const DtypeIcon: Component = $derived(getAppIcon(kDtypeToIcon[dtype] ?? "list-numbers"));
</script>

<span class="root">
<span
	class={["param-chip", accessClass, chipClass]}
	data-access={access}
	data-dtype={dtype}
	title={`${name}: ${dtype}`}
>
	<span class="chip-name">{name}</span>
	<span class="chip-separator" aria-hidden="true"></span>
	<span class="chip-icon" aria-label={dtype}>
		<DtypeIcon size={14} weight="light" />
	</span>
</span>
</span>

<style>
.root {
}

.param-chip {
  --param-chip-gap: 0.15rem;
  --param-chip-text-color: var(--color-text-hi-con);
  --param-chip-separator-color: var(--color-border-subtle);
  --param-chip-border-color: var(--color-border-subtle);

	display: inline-flex;
	align-items: center;
	max-width: 100%;
	min-height: 22px;
	margin-right: var(--param-chip-gap);
	margin-bottom: var(--param-chip-gap);
	border: 1px solid var(--param-chip-border-color);
	border-radius: var(--radius-md);
	color: var(--param-chip-text-color);
	overflow: hidden;
	vertical-align: top;
}

.chip-name,
.chip-icon {
	display: inline-flex;
	align-items: center;
	min-height: 18px;
}

.chip-name {
	min-width: 0;
	padding: 0 0.15rem;
	font-size: var(--font-size-xs);
	color: var(--param-chip-text-color);
	letter-spacing: 0.01em;
	white-space: nowrap;
}

.chip-separator {
	width: 1px;
	align-self: stretch;
	background: var(--param-chip-separator-color);
}

.chip-icon {
	flex-shrink: 0;
	justify-content: center;
	width: 1.1rem;
	color: var(--param-chip-text-color);
}

.chip-I {
	background: var(--tint-blue);
}

.chip-O {
	background: var(--tint-green);
}

.chip-M {
	background: var(--tint-yellow);
}

.selected-chip.param-chip {
	--param-chip-text-color: var(--color-flip-text-hi-con);
	--param-chip-separator-color: var(--color-flip-text-lo-con);
	--param-chip-border-color: var(--color-flip-border-subtle);

	--bg-blue: color-mix(in oklab, var(--color-flip-bg-2), #2186f1 26%);
	--bg-green: color-mix(in oklab, var(--color-flip-bg-2), #2aac4a 26%);
	--bg-yellow: color-mix(in oklab, var(--color-flip-bg-2), #ab8000 26%);
}
</style>
