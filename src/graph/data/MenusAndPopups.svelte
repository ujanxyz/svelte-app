<script lang="ts">
import { type Snippet } from "svelte";
import { MenuCodes } from "../constants";

// Icons.
import ArrowClockwiseIcon from "phosphor-svelte/lib/ArrowClockwiseIcon";
import ClipboardIcon from "phosphor-svelte/lib/ClipboardIcon";
import CodeIcon from "phosphor-svelte/lib/CodeIcon";
import InfoIcon from "phosphor-svelte/lib/InfoIcon";
import LineVerticalIcon from "phosphor-svelte/lib/LineVerticalIcon";
import PentagonIcon from "phosphor-svelte/lib/PentagonIcon";
import PlusIcon from "phosphor-svelte/lib/PlusIcon";
import StackPlusIcon from "phosphor-svelte/lib/StackPlusIcon";
import StackMinusIcon from "phosphor-svelte/lib/StackMinusIcon";
import TrashIcon from "phosphor-svelte/lib/TrashIcon";

const icons: Record<string, Snippet> = {
  [MenuCodes.NEW_NODE]: plusIcon,
  [MenuCodes.NEW_INPUT]: plusIcon,
  [MenuCodes.NEW_OUTPUT]: plusIcon,
  [MenuCodes.RM_NODES]: trashIcon,
  [MenuCodes.RM_EDGES]: trashIcon,
  [MenuCodes.RM_NODE]: trashIcon,
  [MenuCodes.RM_EDGE]: trashIcon,
  [MenuCodes.RM_SELECTION]: trashIcon,
  [MenuCodes.PIPELINE_INFO]: infoIcon,
  [MenuCodes.NODE_INFO]: infoIcon,
  [MenuCodes.NODE_EXEC]: arrowClockwiseIcon,
  [MenuCodes.SELECTION_EXEC]: arrowClockwiseIcon,
};
</script>

<!-- Icons --------------------------------------------------------------------------------------->

{#snippet arrowClockwiseIcon()}
  <ArrowClockwiseIcon size={24} />
{/snippet}

{#snippet codeIcon()}
  <CodeIcon size={24} />
{/snippet}

{#snippet clipboardIcon()}
  <ClipboardIcon size={24} />
{/snippet}

{#snippet infoIcon()}
  <InfoIcon size={24} />
{/snippet}

{#snippet pentagonIcon()}
  <PentagonIcon size={24} />
{/snippet}

{#snippet plusIcon()}
  <PlusIcon size={24} />
{/snippet}

{#snippet stackPlusIcon()}
  <StackPlusIcon size={24} />
{/snippet}

{#snippet stackMinusIcon()}
  <StackMinusIcon size={24} />
{/snippet}

{#snippet lineVerticalIcon()}
  <LineVerticalIcon size={24} />
{/snippet}

{#snippet trashIcon()}
  <TrashIcon size={24} />
{/snippet}
