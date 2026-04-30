<script lang="ts">
import MoveButton from "@/modules/overlay2/MoveButton.svelte";

import CloseButton from "./CloseButton.svelte";

interface Props {
  title: string;
}

const { title }: Props = $props();
const width = 160;
const height = 30;
</script>

<div class="container">
  <span class="title">{title}</span>
  <MoveButton {width} {height}>
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {width} {height}">
      <defs>
        <!-- Define a cross-hatch pattern -->
        <pattern
          id="crossHatch"
          class="hatch"
          patternUnits="userSpaceOnUse"
          width="10"
          height="10"
        >
          <circle cx="5" cy="5" r="2" />
        </pattern>
      </defs>
      <rect
        x="0"
        y="0"
        {width}
        {height}
        fill="url(#crossHatch)"
        stroke="none"
      />
    </svg>
  </MoveButton>
  <CloseButton />
</div>

<style>
.container {
  width: 100%;
  height: 3rem;
  background-color: rgb(0, 0, 0, 50%);
  color: #ffffff;
  padding: 2px 12px;
  display: flex;
  align-items: center;
}
.title {
  font-weight: 600;
  line-height: 0.6rem;
  flex-grow: 1;
}
.hatch {
  stroke: var(--line-color);
  stroke-width: 0.5;
  fill: none;
}
</style>
