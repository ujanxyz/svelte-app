<script lang="ts">
import IconButton from "../components/IconButton.svelte";
import XCircleIcon from "phosphor-svelte/lib/XCircleIcon";

type Props = {
  onclose: () => void;
};
const { onclose }: Props = $props();
</script>

<div class="container">
  <div class="title">
    Mem logs
  </div>
  <div class="icon">
    <IconButton tooltip="close" onclick={onclose}>
      <XCircleIcon size={26} />
    </IconButton>
  </div>
</div>

<style>
.container {
  padding: 4px;
  padding-left: 4px;
  padding-right: 8px;

  display: flex;
  flex-direction: row;
  flex-wrap: nowrap;
  align-items: center;
}
.title {
  flex-grow: 1;
}
.icon {}
</style>