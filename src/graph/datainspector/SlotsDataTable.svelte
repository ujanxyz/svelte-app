<script lang="ts">
import { useGraphService } from "../graph-services";

const slotService = useGraphService("slotService");
console.log(slotService);

$effect(() => {
  const entries = slotService.reactiveSlotEntries();
  console.log(entries);
});
</script>
