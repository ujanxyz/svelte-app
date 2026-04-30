<script lang="ts">
import CheckIcon from "phosphor-svelte/lib/CheckIcon";
// Icons
import XIcon from "phosphor-svelte/lib/XIcon";

import * as overlay2 from "@/modules/overlay2";

const overlay2Instance = overlay2.useOverlayInstance<{}, string>();

function closeOk(ev: MouseEvent) {
  ev.stopPropagation();
  overlay2Instance.settle("Hello");
}

function closeErr(ev: MouseEvent) {
  ev.stopPropagation();
  overlay2Instance.abort();
}
</script>

<button class="closebtn" onclick={closeOk} style="margin-right: 4px;">
  <CheckIcon size={24} style="display: block;" />
</button>
<button class="closebtn" onclick={closeErr}>
  <XIcon size={24} style="display: block;" />
</button>

<style>
.closebtn {
  background-color: rgba(23, 23, 23, 60%);
  color: lightgray;
  width: 32px;
  height: 32px;
  padding: 4px;
  border-radius: 50%;
  cursor: pointer;
}
</style>
