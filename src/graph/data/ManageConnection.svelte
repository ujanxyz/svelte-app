<script lang="ts">
import { useConnection } from "@xyflow/svelte";
import type { ConnectionState } from "@xyflow/system";

const _connection = useConnection();

import debounce from "debounce";

const handleConnDebounced = debounce(handleConnProgress, 120);

$effect(() => {
  const conn = _connection.current;
  handleConnDebounced(conn);
});

function handleConnProgress(state: ConnectionState) {
  // console.log(state);
}
</script>
