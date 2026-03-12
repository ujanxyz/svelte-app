<script lang="ts">
import { useConnection } from "@xyflow/svelte";

const connection = useConnection();

$effect(() => {
  //const conn = connection.current;
  //console.log(conn);
});
</script>
