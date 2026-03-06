<script lang="ts">
import { setContext } from "svelte";
import Card03 from "./Card03.svelte";
import Card02 from "./Card02.svelte";

const testCtxObj = { name: "ctxobj-from-1" };
setContext("abc", testCtxObj);
</script>

<div>
  Card 01 Inside 2: <Card02 />
  Inside 3: <Card03 />
</div>
