<script lang="ts">
  import type { MenuItem, OverlayChildUse } from "./types";

  interface Props {
    overlayUse: OverlayChildUse;
    menuItems: MenuItem[];
  }

  const { menuItems, overlayUse } : Props = $props();
</script>

<div class="contextmenu txt-md-strong" aria-label="Main Menu">
  {#each menuItems as item}
    {#if item === "-"}
      <hr class="sep"/>
    {:else}
      <button onclick={item.handler} class="item">
        {item.label}
        {#if item.shortcut}
          <span class="shortcut">{item.shortcut}</span>
        {/if}
      </button>
    {/if}
  {/each}
</div>

<style>
.contextmenu {
  display: flex;
  min-width: 120px;
  min-height: 24px;
  flex-direction: column;
  padding-top: calc(0.2rem + 1px);
  padding-bottom: calc(0.2rem + 1px);

  font-size: 0.8rem;
  color: #DDDDFF;

  background-color: #222222;
  border: 1px solid #dddddd44;
  border-radius: 4px;
  gap: 2px;

  animation: dropdown-in 200ms ease;
}
hr.sep {
  border-top: 1px solid #dddddd44;
  border-bottom: none;
  width: 100%;
  border-left: 0px;
  border-right: 0px;
  margin: 0.2rem 0px;
  box-sizing: border-box;
}
.item {
    padding: 0.45rem 10px;
    background: none;
    border: none;
    border-radius: 2px;

    display: flex;
    justify-content: space-between;
    place-items: center;
    text-align: left;
    cursor: pointer;
    gap: 5px;
}
button:hover {
    background: #88888844;
}
.shortcut {
    color: #666;
    font-size: 0.8em;
}

@keyframes dropdown-in {
from {
    opacity: 0;
    transform: translateY(-8px);
}
to {
    opacity: 1;
    transform: translateY(0);
}
}
</style>