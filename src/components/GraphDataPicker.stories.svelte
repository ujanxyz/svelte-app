<script module>
  import { defineMeta } from "@storybook/addon-svelte-csf";
  import { fn } from "storybook/test";

  import GraphDataPicker from "./GraphDataPicker.svelte";

  const { Story } = defineMeta({
    title: "Components/GraphDataPicker",
    component: GraphDataPicker,
    tags: ["autodocs"],
    args: {
      title: "Add New Input Field",
      onclose: fn(),
      onsubmit: fn(),
    },
  });
</script>

<!-- Default — 40% width (component controls its own width) -->
<Story name="Default">
  {#snippet template(args)}
    <div style="min-height: 600px; display: flex; align-items: flex-start; padding: 24px;">
      <GraphDataPicker
        title={args.title}
        onclose={args.onclose}
        onsubmit={args.onsubmit}
      />
    </div>
  {/snippet}
</Story>

<!-- Constrained to 480px container -->
<Story name="Container 480px">
  {#snippet template(args)}
    <div style="width: 480px; min-height: 600px; display: flex; align-items: flex-start; padding: 24px; box-sizing: border-box;">
      <GraphDataPicker
        title={args.title}
        onclose={args.onclose}
        onsubmit={args.onsubmit}
      />
    </div>
  {/snippet}
</Story>

<!-- Narrow — forces single column grid -->
<Story name="Narrow 340px">
  {#snippet template(args)}
    <div style="width: 340px; min-height: 600px; display: flex; align-items: flex-start; padding: 8px; box-sizing: border-box;">
      <GraphDataPicker
        title={args.title}
        onclose={args.onclose}
        onsubmit={args.onsubmit}
      />
    </div>
  {/snippet}
</Story>

<!-- Output variant -->
<Story name="Output Field" args={{ title: "Add New Output Field" }}>
  {#snippet template(args)}
    <div style="min-height: 600px; display: flex; align-items: flex-start; padding: 24px;">
      <GraphDataPicker
        title={args.title}
        onclose={args.onclose}
        onsubmit={args.onsubmit}
      />
    </div>
  {/snippet}
</Story>
