<script lang="ts">
import useCurrentOverlay from "../useCurrentOverlay";
// Icons
import XIcon from "phosphor-svelte/lib/XIcon";
import CheckIcon from "phosphor-svelte/lib/CheckIcon";

const overlay = useCurrentOverlay();

function closeOk() {
  overlay.settleOverlay("CLOSED_OK");
}

function closeErr() {
  overlay.abortOverlay();
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
