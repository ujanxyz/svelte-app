<script lang="ts">
import type { Snippet } from "svelte";


interface Props {
  children: Snippet;
  datatype: string;
  onTrigger: (datatype: string, anchor: HTMLButtonElement) => Promise<void>;
}

const { children, datatype, onTrigger }: Props = $props();

async function onClick(ev: MouseEvent): Promise<void> {
  ev.preventDefault();
  const anchor = ev.currentTarget as HTMLButtonElement;
  await onTrigger(datatype, anchor);
}
</script>

<button class="panebtn" onclick={onClick} data-debug-name="slot-pane-btn">
  {@render children()}
</button>

<style>
.panebtn {
  background-color: dodgerblue;
  color: white;
  padding: 8px 16px;
  border: 1px solid rgb(0, 0, 0, 60%);
  border-radius: 4px;
  cursor: pointer;
}
</style>
