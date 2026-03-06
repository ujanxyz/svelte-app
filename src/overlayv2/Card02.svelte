<script lang="ts">
import { getContext, setContext } from "svelte";
import Card03 from "./Card03.svelte";

const testCtxObj = { name: "ctxobj-from-2" };
setContext("abc", testCtxObj);
</script>

<div>
  Card 02 Inside 3 inside 2: <Card03 />
</div>
