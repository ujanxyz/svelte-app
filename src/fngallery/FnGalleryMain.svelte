<script lang="ts">
  import { onMount } from "svelte";
  import { EventKinds } from "../utils/constants";
  import useEventDispatch from "../utils/useEventDispatch";
  import useFetchFnInfos from "./useFetchFnInfos";
  import type { FuncParam, FuncSpec } from "./types";

  interface Props {
    onClose: () => void;
  }

  const { onClose } : Props = $props();
  const dispatchSelect = useEventDispatch(EventKinds.FN_GALLERY_SELECT);
  const {fetchItems, abortFetch} = useFetchFnInfos();

  let itemsPromise = $state(fetchItems());

  onMount(() => {
    return () => abortFetch();
  });

  function onClickItem(ev: PointerEvent | MouseEvent) {
    const code = (ev.target as HTMLButtonElement).dataset.code as string;
    onClose();
    dispatchSelect({code});
  }

</script>

<!-- <div class="gallery txt-md-strong" data-debug-name="gallery-shell">
  {#each galleryItems as {func, label}}
    <button class="item" onclick={onClickItem} data-code={func}>
      {label} / {func}
    </button>
  {/each}
</div> -->

<div class={["gallery-main", "elevated-rounded-md"]}>
<div class="topbar">
  <h2 class="header-l1">www.mockaroo.com</h2>
  <div class="flex-remaining">m</div>
  <input type="text" name="search" class="textfield" value="search"/>
  <div class="iconbtn">X</div>
</div>
{#await itemsPromise}
  <p>Loading...</p>
{:then items}
  <div class="contentroot">
    <div class="gridbox">
        {#each items as item}
          {@render renderFnInfo(item)}
        {/each}
    </div>
    <div class="bottombox">
        Bottom box.        
    </div>
  </div>
{:catch err}
  <p style="color:red;">
    {err.name === "AbortError" ? "Request cancelled." : err.message}
  </p>
{/await}
</div>

{#snippet renderFnInfo(fnInfo: FuncSpec)}
    {@const {id, label, desc, params} = fnInfo}
    <div class="gridcell" data-uj-fn-id={id}>
        <p class="celltypo">{label}</p>
        <p class="celldesc">{desc}</p>
        <p>
            {#each params as {name, access} : FuncParam}
              {@const accessStyle = `param-${access}` }
              <span class={["cellparam", accessStyle]} data-param-role={access}>{name}</span>
            {/each}
        </p>
    </div>
{/snippet}

<style>

.gallery-main {
    width: calc(100vw - 48px);
    height: calc(100vh - 48px);
    max-width: initial;
    background-color: #264359;

    display: flex;
    flex-direction: column;
    align-items: stretch;
}
@media (max-width: 1200px) {
  .gallery-main {
    min-width: 600px;
  }
}

.elevated-rounded-md {
    border-radius: 4px;
    box-shadow:
        0px 11px 15px -7px rgba(var(--box-shadow-rgb), 0.2),
        0px 24px 38px 3px rgba(var(--box-shadow-rgb), 0.14),
        0px 9px 46px 8px rgba(var(--box-shadow-rgb), 0.12);
}

.topbar {
    padding: 12px 12px 12px 24px;
    background-color: #303030;

    font-family: "Roboto", sans-serif;
    font-weight: 400;
    line-height: 1.43;
    color: #ffffff;

    display: flex;
    align-items: center;
}

.header-l1 {
    font-size: 1.25rem;
    font-weight: bold;
    line-height: 1.2;
}

.flex-remaining {
    flex: 1 1 0%;
}

.textfield {
    width: 250px;
    height: 32px;
    border-radius: 2px;
    font-size: 1.1rem;
    padding-left: 12px;
}

.iconbtn {
    opacity: 0.5;
    margin-left: 16px;
    border-radius: 50%;
    padding: 2px 8px;
    width: 28px;
    height: 28px;
}
.iconbtn:hover {
    opacity: 1.0;
    background-color: #7d7373;
}



.contentroot {
    flex: 1 1 0%;
    overflow-y: auto;

    display: flex;
    align-items: stretch;
    flex-direction: column;
}

.gridbox {
    width: 100%;
    max-height: 100%;

    flex: 1;
    align-self: flex-start;

    padding: 18px 12px 12px 12px;

    display: flex;
    justify-content: center;
    align-items: flex-start;
    align-content: flex-start;
    flex-wrap: wrap;
    overflow-y: auto;
    row-gap: 18px;
    column-gap: 12px;
}

.bottombox {
    width: 100%;
    align-items: center;
    white-space: nowrap;
    min-height: 32px;
    background-color: #303030;

    padding: 12px;
}

.gridcell {
    width: 240px;
    cursor: pointer;
    height: 110px;
    display: block;
    padding: 12px;
    overflow-x: hidden;
    overflow-y: hidden;
    box-sizing: border-box;
    transition: 100ms linear;
    border-radius: 7px;

    background-color: #30303044;
}

.gridcell:hover {
    background-color: #303030;
}

.celltypo {
    font-weight: 700;
    line-height: 1.5;
}

.celldesc {
    font-size: 0.7rem;
    font-style: italic;
    font-weight: 400;
    line-height: 1.66;
}

.cellparam {
    display: inline-flex;
    align-items: center;

    margin-left: 0.15rem;
    padding: 0.1rem 0.125rem;
    font-size: 0.7rem;

    color: #e0e0e0;
    background-color: #606060; /* #404040; */
    border-radius: 2px;
    cursor: default; /* Default cursor for static chips */
    white-space: nowrap; /* Prevents text from wrapping */
}
.param-i {
    background-color: #3047a5;
}
.param-o {
    background-color: #217446;
}
.param-m {
    background-color: #736c21;
}



.cellparam:first-child {
    margin-left: 0px;
}

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
