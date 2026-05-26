<script lang="ts">

interface Props {
  label: string;
  nodeId: string;
}

const { label, nodeId }: Props = $props();

</script>

<div class="node-header">
  <h3 class="card-title">{label}</h3>
  <span class="nodeid">{nodeId}</span>
</div>

<style>

.node-header {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  padding: var(--space-2) var(--space-3);
}

.card-title {
  font-weight: 600;
  font-size: 0.45rem;
  margin: 0;
}

.nodeid {
  font-size: 0.35rem;
  font-family: var(--font-family-mono);
  color: var(--color-text-lo-con);
}

</style>
