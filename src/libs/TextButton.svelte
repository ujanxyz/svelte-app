<script lang="ts">
  type Props = {
    text: string;
    onclick: (ev: PointerEvent | MouseEvent) => void;
  };
  const { text, onclick }: Props = $props();
</script>

<div>
    <button onclick={onclick}>
        <span class="txt-md-strong">{text}</span>
    </button>
</div>

<style>
div {
    display: inline;
}
button {
    font-size: large;
    padding: 2px 4px;
    background-color: #2e3e5c;
}
</style>