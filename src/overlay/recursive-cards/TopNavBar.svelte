<script lang="ts">
import CloseButton from "./CloseButton.svelte";
import MoveButton from "./MoveButton.svelte";

interface Props {
  title: string;
}

const { title }: Props = $props();
</script>

<div class="container">
  <span class="title">{title}</span>
  <MoveButton width={160} height={30} debugTitle={title} />
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
</style>
