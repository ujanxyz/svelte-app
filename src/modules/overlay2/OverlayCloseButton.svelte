<script lang="ts">
import { getAppIcon } from "@/utils/appIcons";

import { useOverlayInstance } from "./useOverlayInstance";

type IconPropValue = string | number | boolean | undefined;

interface Props {
  iconProps?: Record<string, IconPropValue>;
  class?: string;
}

const {
  iconProps = {},
  class: className = "",
}: Props = $props();

const overlay = useOverlayInstance<unknown, unknown>();
const CloseIcon = getAppIcon("x");
const mergedIconProps = $derived({ size: 22, weight: "bold", ...iconProps });

function onClick(): void {
  overlay.abort();
}
</script>

<button
  type="button"
  class={["overlay-close-btn", className]}
  onclick={onClick}
  aria-label="Close"
>
  <CloseIcon {...mergedIconProps} />
</button>

<style>
.overlay-close-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 34px;
  height: 34px;
  border: 1px solid var(--border-default);
  border-radius: var(--radius-lg);
  background: var(--color-bg-3);
  color: var(--color-text-hi-con);
  cursor: pointer;
}

.overlay-close-btn:hover {
  background: var(--color-bg-4);
}

.overlay-close-btn:focus-visible {
  outline: 2px solid var(--color-accent);
  outline-offset: 2px;
}
</style>