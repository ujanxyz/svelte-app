<script lang="ts">
  import { newRandomId } from "../jsutils/idUtils";

  interface Props {
    group?: string;
  };

  const { group }: Props = $props();

  /* svelte-ignore state_referenced_locally */
  const name = group ?? ("radio_" + newRandomId());
</script>

<div class="radio-group txt-sm-strong">

  <label class="radio-item">
    <input type="radio" {name} value="1" checked>
    <span class="radio-ui">Opt 1</span>
  </label>

  <label class="radio-item">
    <input type="radio" {name} value="2">
    <span class="radio-ui">Opt 2</span>
  </label>

</div>

<style>
  .radio-group {
    display: inline-flex;

    border: 1px solid #484848;
    border-radius: 4px;
    overflow: hidden;
  }

  .radio-group:focus-within {
    outline: 2px solid #4f46e5;
    outline-offset: 2px;
  }

  .radio-item {
    cursor: pointer;
  }

  /* Hide native radio visually but keep it accessible */
  .radio-item input[type="radio"] {
    position: absolute;
    opacity: 0;
    width: 0px;
    height: 0px;
    pointer-events: none;
  }

  .radio-ui {
    display: inline-block;
    padding: 0.3rem 0.7rem;
    transition: all 0.15s ease;
  }

  /* Hover effect */
  .radio-item:hover .radio-ui {
    border-color: #666;
    background: #f5f5f5;
  }

  .radio-item input[type="radio"]:checked + .radio-ui {
    border-color: #4f46e5;
    background: #4f46e5;
    color: white;
  }

  /* Focus-visible for keyboard accessibility */
  .radio-item input[type="radio"]:focus-visible + .radio-ui {
    outline: 2px solid #4f46e5;
    outline-offset: 2px;
  }


</style>