<script lang="ts">
import useCurrentOverlay from "./useCurrentOverlay";

const overlay = useCurrentOverlay();

function closeOk() {
  overlay.settleOverlay("CLOSED");
}

function closeErr() {
  overlay.abortOverlay();
}
</script>

<button class="closebtn" onclick={closeOk}>X</button>
<button class="closebtn" onclick={closeErr}>?</button>

<style>
.closebtn {
  background-color: rgba(23, 23, 23, 60%);
  color: lightgray;
  width: 32px;
  height: 32px;
  padding: 2px;
  border-radius: 50%;
  cursor: pointer;
}
</style>
