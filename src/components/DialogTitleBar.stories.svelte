<script module>
  import { defineMeta } from "@storybook/addon-svelte-csf";
  import { fn } from "storybook/test";

  import DialogTitleBar from "./DialogTitleBar.svelte";

  const { Story } = defineMeta({
    title: "Components/DialogTitleBar",
    component: DialogTitleBar,
    tags: ["autodocs"],
    args: {
      title: "Add New Input Field",
      onclose: fn(),
    },
  });
</script>

<!-- Unrestricted width -->
<Story name="Default">
  {#snippet template(args)}
    <div style="border: 1px solid #ccc; border-radius: 6px; overflow: hidden;">
      <DialogTitleBar title={args.title} onclose={args.onclose} />
    </div>
  {/snippet}
</Story>

<!-- Fixed width — 400px -->
<Story name="Fixed Width 400">
  {#snippet template(args)}
    <div style="width: 400px; border: 1px solid #ccc; border-radius: 6px; overflow: hidden;">
      <DialogTitleBar title={args.title} onclose={args.onclose} />
    </div>
  {/snippet}
</Story>

<!-- Fixed width — 280px (narrow) -->
<Story name="Narrow 280">
  {#snippet template(args)}
    <div style="width: 280px; border: 1px solid #ccc; border-radius: 6px; overflow: hidden;">
      <DialogTitleBar title={args.title} onclose={args.onclose} />
    </div>
  {/snippet}
</Story>

<!-- Long title -->
<Story name="Long Title" args={{ title: "Configure Output Pipeline Data Field" }}>
  {#snippet template(args)}
    <div style="width: 400px; border: 1px solid #ccc; border-radius: 6px; overflow: hidden;">
      <DialogTitleBar title={args.title} onclose={args.onclose} />
    </div>
  {/snippet}
</Story>
