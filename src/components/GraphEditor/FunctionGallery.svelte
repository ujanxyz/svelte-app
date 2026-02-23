<script lang="ts">
  import type { OverlayChildUse } from "../overlay/types";


  interface Props {
    overlayUse: OverlayChildUse;
  }

  interface GalleryItem {
    func: string;
    label: string;
  };

  const { overlayUse } : Props = $props();

  const galleryItems: GalleryItem[] = [
    { func: "math-1ary", label: "New Node ..."},
    { func: "math-2ary", label: "New Cluster ..."},
    { func: "random", label: "Center viewport"},
    { func: "noise-1d", label: "Fit to view"},
	];

  function onClickItem(ev: PointerEvent | MouseEvent) {
    const code = (ev.target as HTMLButtonElement).dataset.code as string;
    overlayUse.close();
    console.log("Insert function: " + code);
  }

</script>

<div class="gallery txt-md-strong" data-debug-name="gallery-shell">
  {#each galleryItems as {func, label}}
    <button class="item" onclick={onClickItem} data-code={func}>
      {label} / {func}
    </button>
  {/each}
</div>

<style>
.gallery {
  min-height: 60px;
  min-width: 5rem;
  max-width: 25rem;

  padding-top: calc(2.2rem + 1px);
  padding-bottom: calc(2.2rem + 1px);
  padding-left: 0.5rem;
  padding-right: 0.5rem;

  margin: 0 auto;
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  justify-content: center safe;

  align-items: flex-start;
  align-content: flex-start;

  font-size: 0.8rem;
  color: #DDDDFF;
  background-color: #264359;
  border: 1px solid #dddddd44;
  border-radius: 4px;
}
.item {
  width: 6rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 6px;

  background-color: #3c3c3c;
  border: 1px solid #dddddd44;
  border-radius: 4px;
  cursor: pointer;
  transition: background-color 0.2s;
}
.item:hover {
    background-color: #1c1c1c;
}
</style>