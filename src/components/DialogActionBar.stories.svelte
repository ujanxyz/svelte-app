<script module>
  import { defineMeta } from "@storybook/addon-svelte-csf";
  import { fn } from "storybook/test";

  import DialogActionBar from "./DialogActionBar.svelte";

  const { Story } = defineMeta({
    title: "Components/DialogActionBar",
    component: DialogActionBar,
    tags: ["autodocs"],
    args: {
      oncancel: fn(),
      onconfirm: fn(),
      confirmLabel: "OK",
      confirmDisabled: false,
    },
  });
</script>

<!-- Default (unrestricted width) -->
<Story name="Default">
  {#snippet template(args)}
    <div style="border: 1px solid #ccc; border-radius: 6px; overflow: hidden;">
      <DialogActionBar
        oncancel={args.oncancel}
        onconfirm={args.onconfirm}
        confirmLabel={args.confirmLabel}
        confirmDisabled={args.confirmDisabled}
      />
    </div>
  {/snippet}
</Story>

<!-- Custom confirm label: ADD FIELD -->
<Story name="Add Field Label" args={{ confirmLabel: "ADD FIELD" }}>
  {#snippet template(args)}
    <div style="width: 500px; border: 1px solid #ccc; border-radius: 6px; overflow: hidden;">
      <DialogActionBar
        oncancel={args.oncancel}
        onconfirm={args.onconfirm}
        confirmLabel={args.confirmLabel}
        confirmDisabled={args.confirmDisabled}
      />
    </div>
  {/snippet}
</Story>

<!-- Disabled confirm -->
<Story name="Confirm Disabled" args={{ confirmLabel: "ADD FIELD", confirmDisabled: true }}>
  {#snippet template(args)}
    <div style="width: 500px; border: 1px solid #ccc; border-radius: 6px; overflow: hidden;">
      <DialogActionBar
        oncancel={args.oncancel}
        onconfirm={args.onconfirm}
        confirmLabel={args.confirmLabel}
        confirmDisabled={args.confirmDisabled}
      />
    </div>
  {/snippet}
</Story>

<!-- Fixed width — 280px narrow -->
<Story name="Narrow 280" args={{ confirmLabel: "OK" }}>
  {#snippet template(args)}
    <div style="width: 280px; border: 1px solid #ccc; border-radius: 6px; overflow: hidden;">
      <DialogActionBar
        oncancel={args.oncancel}
        onconfirm={args.onconfirm}
        confirmLabel={args.confirmLabel}
        confirmDisabled={args.confirmDisabled}
      />
    </div>
  {/snippet}
</Story>
