<script lang="ts">
import { getContext } from "svelte";

const testCtxObj = getContext("abc");
console.log("In Card-03, ctx: ", testCtxObj);
</script>

<div>Card 03</div>
