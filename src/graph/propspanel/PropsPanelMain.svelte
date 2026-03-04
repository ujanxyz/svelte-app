<script lang="ts">
import StyleGalleryMain from "../../modules/stylegallery/StyleGalleryMain.svelte";
import { Button } from "svelte-tweakpane-ui";

import { Color } from "svelte-tweakpane-ui";

let startColor = "#fff000";
let endColor = "#ff00ff";
</script>

<div class="contents">
  <StyleGalleryMain />
  <hr />

  <div class="paneui">
    <Button on:click={() => alert("🎛️")} />
    <Color bind:value={startColor} />
    <Color bind:value={endColor} />
    <Color bind:value={endColor} />
    <Color bind:value={endColor} />
    <Color bind:value={endColor} />
    <Color bind:value={endColor} />
    <Color bind:value={endColor} />
    <Color bind:value={endColor} />
    <Color bind:value={endColor} />
    <Color bind:value={endColor} />
    <Button on:click={() => alert("🎛️")} />
    <div class="demo" style:--a={startColor} style:--b={endColor}></div>
  </div>
</div>

<style>
.demo {
  aspect-ratio: 1;
  width: 100%;
  background: linear-gradient(to top, var(--a), var(--b));
}
.paneui {
  --bld-vw: 50px;
  width: 120px;
  max-width: 200px;
}
</style>
