<script module>
  import { defineMeta } from "@storybook/addon-svelte-csf";
  import FolderIcon from "phosphor-svelte/lib/FolderIcon";
  import ImageIcon from "phosphor-svelte/lib/ImageIcon";
  import { fn } from "storybook/test";

  import ItemCard from "./ItemCard.svelte";

  const { Story } = defineMeta({
    title: "Components/ItemCard",
    component: ItemCard,
    tags: ["autodocs"],
    args: {
      title: "Item Title",
      subtext: "Supporting detail text",
      selected: false,
      onclick: fn(),
    },
  });
</script>

<!-- Default: unselected, default box icon -->
<Story name="Default">
  {#snippet template(args)}
    <div style="width: 320px;">
      <ItemCard
        title={args.title}
        subtext={args.subtext}
        selected={args.selected}
        onclick={args.onclick}
      />
    </div>
  {/snippet}
</Story>

<!-- Selected state -->
<Story name="Selected" args={{ selected: true, title: "Selected Item", subtext: "This card is active" }}>
  {#snippet template(args)}
    <div style="width: 320px;">
      <ItemCard
        title={args.title}
        subtext={args.subtext}
        selected={args.selected}
        onclick={args.onclick}
      />
    </div>
  {/snippet}
</Story>

<!-- Custom icon: Folder -->
<Story name="Folder Type" args={{ title: "Documents Folder", subtext: "12 items" }}>
  {#snippet template(args)}
    <div style="width: 320px;">
      <ItemCard
        title={args.title}
        subtext={args.subtext}
        selected={args.selected}
        onclick={args.onclick}
      >
        {#snippet icon()}
          <FolderIcon size={16} />
        {/snippet}
      </ItemCard>
    </div>
  {/snippet}
</Story>

<!-- Custom icon: Image -->
<Story name="Image Type" args={{ title: "hero-banner.png", subtext: "2.4 MB · PNG" }}>
  {#snippet template(args)}
    <div style="width: 320px;">
      <ItemCard
        title={args.title}
        subtext={args.subtext}
        selected={args.selected}
        onclick={args.onclick}
      >
        {#snippet icon()}
          <ImageIcon size={16} />
        {/snippet}
      </ItemCard>
    </div>
  {/snippet}
</Story>

<!-- Interactive toggle demo -->
<Story name="Toggle Select">
  {#snippet template(args)}
    <div style="width: 320px; display: flex; flex-direction: column; gap: 8px;">
      <ItemCard
        title={args.title}
        subtext={args.subtext}
        selected={args.selected}
        onclick={args.onclick}
      />
    </div>
  {/snippet}
</Story>
