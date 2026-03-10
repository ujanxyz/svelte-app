<script lang="ts">
import { ReturnStatus } from "../constants";
import type { StatusOr } from "../types";
import DemoMenue from "./DemoMenue.svelte";

let menuInstance: DemoMenue;

async function openContextMenu(ev: MouseEvent) {
  const result = (await menuInstance.showMenu(ev)) as StatusOr<string>;
  if (result.status === ReturnStatus.OK) {
    console.log("Success: ", result.value);
  } else {
    console.log("Failed status: ", result.status);
  }
}
</script>

<button class="trigger" oncontextmenu={openContextMenu}>
  <h2 class="title">Trigger area</h2>
  <span class="subtext">Right click to open menu</span>
</button>
<DemoMenue bind:this={menuInstance} />

<style>
.trigger {
  background-color: #2656aa;
  width: 40%;
  height: 25%;
  border-radius: 8px;
  padding: 4px 8px;
  font-weight: 400;
}
.title {
  font-size: 2em;
  font-weight: 200;
  letter-spacing: 0.4rem;
  color: #f0f0f0;
}
.subtext {
  color: rgb(224, 224, 224, 60%);
}
</style>
