<script lang="ts">
  import type { FuncParam, FuncSpec } from "./types";
  interface Props {
    spec: FuncSpec;
    onSelect: (spec: FuncSpec) => void;
  }

  const { spec, onSelect }: Props = $props();

  /* svelte-ignore state_referenced_locally */
  const {id, label, desc, params} = spec;

  function onclick(ev: MouseEvent) {
    onSelect(spec);
  }
</script>

<button class="gridcell" data-uj-fn-id={id} onclick={onclick}>
    <p class="celltypo">{label}</p>
    <p class="celldesc">{desc}</p>
    <p>
        {#each params as {name, access} : FuncParam}
          {@const accessStyle = `param-${access}` }
          <span class={["cellparam", accessStyle]} data-param-role={access}>{name}</span>
        {/each}
    </p>
</button>

<style>
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

</style>
