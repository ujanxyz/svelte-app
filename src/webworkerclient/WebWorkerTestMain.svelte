<script lang="ts">
import { onMount } from "svelte";

import TextButton from "@/components/TextButton.svelte";

import { useWebWorker } from "./useWebWorker";

const { remoteBuilder } = useWebWorker();

onMount(() => {
  console.log(remoteBuilder);
});

function handleAddNode() {
  console.log("Add node ....");
  remoteBuilder.sendTestMessage();
}
</script>

<div>
  <TextButton text="Add Node" onclick={handleAddNode} />
</div>
