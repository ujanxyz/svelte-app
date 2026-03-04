<script lang="ts">
  type Props = {
    text: string;
    onclick: () => void;
  };
  const { text, onclick }: Props = $props();
</script>

<div>
    <button onclick={onclick} class="rounded-sm">
        <span class="text-md-con txt-md-strong">{text}</span>
    </button>
</div>


<style>
div {
    display: inline;
}

button {
  padding: var(--space-1) var(--space-2);
  background-color: var(--color-bg-3);
  border: 1px solid var(--color-border-subtle);
  display: inline-flex;
  align-items: center;
  cursor: pointer;

  font-weight: var(--font-weight-medium);
}

button:hover {
  background-color: var(--color-bg-4);
  border-color: var(--color-border-default);
}

button:active {
  background-color: var(--color-accent-fill);
  color: var(--color-accent-text);
}

button:hover span, button:active span {
  color: var(--color-text-hi-con);
}

</style>