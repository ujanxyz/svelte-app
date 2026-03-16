<script lang="ts">
import { onMount } from "svelte";

import { useWebWorker } from "./useWebWorker";

const ww = useWebWorker();

onMount(() => {
  console.log(ww);
  ww.sendMessage();
});

</script>
