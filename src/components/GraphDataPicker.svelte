<script lang="ts">
  import ArrowRightIcon from "phosphor-svelte/lib/ArrowRightIcon";
  import BracketsCurlyIcon from "phosphor-svelte/lib/BracketsCurlyIcon";
  import BrainIcon from "phosphor-svelte/lib/BrainIcon";
  import CubeIcon from "phosphor-svelte/lib/CubeIcon";
  import HashIcon from "phosphor-svelte/lib/HashIcon";
  import ImageIcon from "phosphor-svelte/lib/ImageIcon";
  import PentagonIcon from "phosphor-svelte/lib/PentagonIcon";
  import SpeakerHighIcon from "phosphor-svelte/lib/SpeakerHighIcon";
  import TableIcon from "phosphor-svelte/lib/TableIcon";
  import type { Component } from "svelte";

  import DialogActionBar from "./DialogActionBar.svelte";
  import DialogTitleBar from "./DialogTitleBar.svelte";
  import ItemCard from "./ItemCard.svelte";

  type DataTypeEntry = {
    id: string;
    label: string;
    subtext: string;
    icon: Component<{ size: number }>;
  };

  const DATA_TYPES: DataTypeEntry[] = [
    { id: "scalar", label: "Scalar", subtext: "Integer, Float, Number", icon: HashIcon },
    { id: "geometry2d", label: "2D Geometry", subtext: "Points, Lines, Paths, Shapes", icon: PentagonIcon },
    { id: "bitmap", label: "Bitmap", subtext: "Pixel Data, Image, Texture", icon: ImageIcon },
    { id: "vector", label: "Vector", subtext: "Direction, Magnitude, 3D Velocity", icon: ArrowRightIcon },
    { id: "table", label: "Table", subtext: "Tabular Data, CSV, Database Records", icon: TableIcon },
    { id: "json", label: "JSON / Struct", subtext: "Hierarchical Data, Object Structure", icon: BracketsCurlyIcon },
    { id: "geometry3d", label: "3D Geometry", subtext: "Meshes, Vertices, Point Clouds", icon: CubeIcon },
    { id: "audio", label: "Audio Stream", subtext: "Audio Waveform, Signals", icon: SpeakerHighIcon },
    { id: "neural", label: "Neural Network", subtext: "Hierarchical Data, Pixel Data", icon: BrainIcon },
  ];

  type Props = {
    title?: string;
    onclose: () => void;
    onsubmit: (name: string, dtype: string) => void;
  };

  const {
    title = "Add New Input Field",
    onclose,
    onsubmit,
  }: Props = $props();

  let fieldName = $state("");
  let selectedDtype = $state<string | null>(null);
  let isValidating = $state(false);
  let isNameValid = $state(false);
  let validationHint = $state("Enter a field name to validate.");
  let validationTicket = 0;

  const selectedTypeDisplay = $derived(selectedDtype ?? "<none>");
  const selectedNameDisplay = $derived(fieldName.trim() || "<empty>");
  const hasValidationError = $derived(
    fieldName.trim().length > 0 && !isValidating && !isNameValid,
  );
  const isPairValidated = $derived(isNameValid && selectedDtype !== null);
  const canSubmit = $derived(isPairValidated && !isValidating);

  const FIELD_NAME_PATTERN = /^[A-Za-z][A-Za-z0-9_]*$/;

  async function validateFieldName(name: string): Promise<boolean> {
    await new Promise((resolve) => setTimeout(resolve, 1000));
    return FIELD_NAME_PATTERN.test(name);
  }

  $effect(() => {
    const name = fieldName.trim();
    validationTicket += 1;
    const currentTicket = validationTicket;

    if (!name) {
      isValidating = false;
      isNameValid = false;
      validationHint = "Enter a field name to validate.";
      return;
    }

    isValidating = true;
    isNameValid = false;
    validationHint = "Validating name...";

    void (async () => {
      const valid = await validateFieldName(name);
      if (currentTicket !== validationTicket) return;
      isValidating = false;
      isNameValid = valid;
      validationHint = valid
        ? "Name validated."
        : "Invalid name. Use letters, digits, underscore, and start with a letter.";
    })();
  });

  function handleSubmit() {
    if (!canSubmit) return;
    onsubmit(fieldName.trim(), selectedDtype!);
  }
</script>

<div class="dialog">
  <DialogTitleBar {title} {onclose} />

  <div class="body">
    <section class="type-section">
      <h3 class="section-heading">Select Data Type</h3>
      <div class="type-scroll">
        <div class="type-scroll-inner">
          <div class="type-grid">
            {#each DATA_TYPES as dtype (dtype.id)}
              {@const IconComp = dtype.icon}
              <ItemCard
                title={dtype.label}
                subtext={dtype.subtext}
                selected={selectedDtype === dtype.id}
                onclick={() => (selectedDtype = dtype.id)}
              >
                {#snippet icon()}
                  <IconComp size={18} />
                {/snippet}
              </ItemCard>
            {/each}
          </div>
        </div>
      </div>
    </section>

    <section class="form-section">
      <label class="field-label" for="field-name">Field Name</label>
      <input
        id="field-name"
        class="field-input"
        type="text"
        placeholder="e.g., Input_Image_Processing_Node_1"
        bind:value={fieldName}
      />
      <span class="validation-hint" class:validation-error={hasValidationError}>{validationHint}</span>
    </section>

    <section class="status-row" aria-live="polite">
      <strong class="status-label">Selected:</strong>
      <br/>
      <strong class="status-chip">type: {selectedTypeDisplay}</strong>
      <strong class="status-chip">name: {selectedNameDisplay}</strong>
      <label class="validated-flag" for="validated-pair">
        <input
          id="validated-pair"
          type="checkbox"
          checked={isPairValidated}
          disabled
        />
        validated
      </label>
    </section>
  </div>

  <DialogActionBar
    oncancel={onclose}
    onconfirm={handleSubmit}
    confirmLabel="ADD FIELD"
    confirmDisabled={!canSubmit}
  />
</div>

<style>
  .dialog {
    display: flex;
    flex-direction: column;
    max-height: 80vh;
    border-radius: var(--radius-xl);
    border: 1px solid var(--border-subtle);
    background-color: var(--surface-page);
    box-shadow: var(--shadow-lg);
    overflow: hidden;
  }

  .body {
    flex: 1;
    overflow-y: auto;
    padding: var(--space-6);
    display: flex;
    flex-direction: column;
    gap: var(--space-7);
  }

  .section-heading {
    font-family: var(--font-family-sans);
    font-size: var(--font-size-md);
    font-weight: var(--font-weight-bold);
    color: var(--text-primary);
    margin: 0 0 var(--space-5) 0;
  }

  .form-section {
    display: flex;
    flex-direction: column;
    gap: var(--space-3);
  }

  .field-label {
    font-family: var(--font-family-sans);
    font-size: var(--font-size-md);
    font-weight: var(--font-weight-bold);
    color: var(--text-primary);
  }

  .field-input {
    width: 100%;
    box-sizing: border-box;
    padding: var(--space-4) var(--space-5);
    border: 1px solid var(--border-default);
    border-radius: var(--radius-md);
    background-color: var(--surface-page);
    color: var(--text-primary);
    font-family: var(--font-family-sans);
    font-size: var(--font-size-sm);
    outline: none;
    transition: border-color 120ms ease;
  }

  .field-input::placeholder {
    color: var(--text-tertiary);
  }

  .field-input:focus {
    border-color: var(--interactive-selected-bg);
    box-shadow: 0 0 0 2px color-mix(in srgb, var(--interactive-selected-bg) 25%, transparent);
  }

  .type-section {
    display: flex;
    flex-direction: column;
    min-height: 0;
  }

  .type-scroll {
    height: 10rem;
    min-height: 180px;
    overflow: hidden;
  }

  .type-scroll-inner {
    height: 100%;
    overflow-y: auto;
    overflow-x: hidden;
  }

  .type-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: var(--space-4);
  }

  .validation-hint {
    font-family: var(--font-family-sans);
    font-size: var(--font-size-xs);
    color: var(--text-secondary);
  }

  .validation-hint.validation-error {
    color: var(--text-danger);
  }

  .status-row {
    display: flex;
    align-items: center;
    gap: var(--space-3);
    padding-top: var(--space-2);
    border-top: 1px solid var(--border-subtle);
    flex-wrap: wrap;
  }

  .status-label {
    font-family: var(--font-family-sans);
    font-size: var(--font-size-sm);
    font-weight: var(--font-weight-bold);
    color: var(--text-primary);
  }

  .status-chip {
    display: inline-flex;
    align-items: center;
    padding: var(--space-2) var(--space-4);
    border: 1px solid var(--border-default);
    border-radius: var(--radius-xl);
    background-color: var(--surface-elevated);
    font-family: var(--font-family-mono);
    font-size: var(--font-size-xs);
    color: var(--text-primary);
  }

  .validated-flag {
    display: inline-flex;
    align-items: center;
    gap: var(--space-2);
    font-family: var(--font-family-sans);
    font-size: var(--font-size-xs);
    color: var(--text-secondary);
  }

  .validated-flag input {
    width: 12px;
    height: 12px;
    margin: 0;
  }

  @container (max-width: 480px) {
    .type-grid {
      grid-template-columns: 1fr;
    }
  }

  /* Fallback for browsers without container query support */
  @media (max-width: 560px) {
    .type-grid {
      grid-template-columns: 1fr;
    }
  }
</style>
