<script lang="ts">
  import { onMount } from "svelte";
  import { EventKinds } from "../utils/constants";
  import useEventDispatch from "../utils/useEventDispatch";
  import useFetchFnInfos from "./useFetchFnInfos";
  import type { FuncSpec } from "./types";
  import FunctionCard from "./FunctionCard.svelte";

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

  function onSelect(spec: FuncSpec) {
    onClose();
    console.log(spec);
    dispatchSelect({code: spec.id});
  }

</script>

<div class={["gallery-main", "elevated-rounded-md"]}>
<div class="topbar">
  <h2 class="header-l1">www.mockaroo.com</h2>
  <div class="flex-remaining">m</div>
  <input type="text" name="search" class="textfield" value="search"/>
  <button  aria-label="close" class="iconbtn" onclick={() => onClose()}>X</button>
</div>
{#await itemsPromise}
  <p>Loading...</p>
{:then items}
  <div class="contentroot">
    <div class="gridbox">
        {#each items as item}
          <FunctionCard spec={item} {onSelect} />
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

</style>
