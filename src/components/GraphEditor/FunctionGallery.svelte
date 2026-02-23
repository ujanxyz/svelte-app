<script lang="ts">
  import { EventKinds } from "../../utils/constants";
  import useEventDispatch from "../../utils/useEventDispatch";
  import type { OverlayChildUse } from "../overlay/types";

  interface Props {
    overlayUse: OverlayChildUse;
  }

  interface GalleryItem {
    func: string;
    label: string;
  };

  const { overlayUse } : Props = $props();
  const dispatchSelect = useEventDispatch(EventKinds.FN_GALLERY_SELECT);

  const galleryItems: GalleryItem[] = [
    { func: "math-1ary", label: "label here"},
    { func: "math-2ary", label: "label here"},
    { func: "random", label: "label here"},
    { func: "noise-1d", label: "label here"},
	];

  function onClickItem(ev: PointerEvent | MouseEvent) {
    const code = (ev.target as HTMLButtonElement).dataset.code as string;
    overlayUse.close();
    dispatchSelect({code});
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
  max-width: 80rem;

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