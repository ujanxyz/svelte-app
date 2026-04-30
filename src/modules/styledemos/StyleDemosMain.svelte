<script lang="ts">
import "@/app/styles/tokens.css";

interface TokenRef {
  label: string;
  varName: string;
}

const fontSizes: TokenRef[] = [
  { label: "xxs", varName: "--font-size-xxs" },
  { label: "xs", varName: "--font-size-xs" },
  { label: "sm", varName: "--font-size-sm" },
  { label: "md", varName: "--font-size-md" },
  { label: "lg", varName: "--font-size-lg" },
  { label: "xl", varName: "--font-size-xl" },
  { label: "xxl", varName: "--font-size-xxl" },
];

const fontWeights: TokenRef[] = [
  { label: "thin", varName: "--font-weight-thin" },
  { label: "normal", varName: "--font-weight-normal" },
  { label: "medium", varName: "--font-weight-medium" },
  { label: "bold", varName: "--font-weight-bold" },
];

const bgTokens: TokenRef[] = [
  { label: "surface-page", varName: "--surface-page" },
  { label: "surface-panel", varName: "--surface-panel" },
  { label: "surface-elevated", varName: "--surface-elevated" },
  { label: "bg-3", varName: "--color-bg-3" },
  { label: "bg-4", varName: "--color-bg-4" },
];

const textTokens: TokenRef[] = [
  { label: "text-primary", varName: "--text-primary" },
  { label: "text-secondary", varName: "--text-secondary" },
  { label: "text-tertiary", varName: "--text-tertiary" },
  { label: "text-danger", varName: "--text-danger" },
  { label: "interactive-primary-text", varName: "--interactive-primary-text" },
];

const brandBgTokens: TokenRef[] = [
  { label: "brand-action-100", varName: "--brand-action-100" },
  { label: "brand-action-300", varName: "--brand-action-300" },
  { label: "brand-action-500", varName: "--brand-action-500" },
  { label: "brand-action-700", varName: "--brand-action-700" },
  { label: "brand-sand", varName: "--brand-sand" },
  { label: "brand-fog", varName: "--brand-fog" },
];

const brandFgTokens: TokenRef[] = [
  { label: "brand-ink", varName: "--brand-ink" },
  { label: "text-primary", varName: "--text-primary" },
  { label: "interactive-primary-text", varName: "--interactive-primary-text" },
];

const uiModes = ["buttons", "inputs", "cards"] as const;

type UiMode = (typeof uiModes)[number];
type ThemeMode = "light" | "dark";
type LineHeightMode = "compact" | "tight" | "normal" | "loose";
type TableView = "typography" | "contrast" | "brand";

let theme = $state<ThemeMode>("light");
let lineHeight = $state<LineHeightMode>("normal");
let uiMode = $state<UiMode>("buttons");
let activeTable = $state<TableView>("typography");

const sampleSentence = "Quartz node packs vivid glyphs for a polished UI review.";

function lineHeightVar(): string {
  return `var(--line-height-${lineHeight})`;
}

function uiSample(bgVar: string, fgVar: string): string {
  if (uiMode === "buttons") {
    return "Button + secondary";
  }
  if (uiMode === "inputs") {
    return "Filled text field";
  }
  return "Card with title bar";
}

$effect(() => {
  if (typeof document === "undefined") return;
  document.documentElement.setAttribute("data-theme", theme);
});
</script>

<div class="viewport" data-theme={theme}>
  <div class="page">
    <header class="hero card">
      <div>
        <h1>Style Tokens Demo Lab</h1>
        <p>Contingency tables for typography, foreground/background contrast, and brand-driven UI combinations.</p>
      </div>
      <div class="controls">
        <fieldset>
          <legend>Theme</legend>
          <label><input type="radio" bind:group={theme} value="light" /> Light</label>
          <label><input type="radio" bind:group={theme} value="dark" /> Dark</label>
        </fieldset>
        <fieldset>
          <legend>Line Height</legend>
          <label><input type="radio" bind:group={lineHeight} value="compact" /> Compact</label>
          <label><input type="radio" bind:group={lineHeight} value="tight" /> Tight</label>
          <label><input type="radio" bind:group={lineHeight} value="normal" /> Normal</label>
          <label><input type="radio" bind:group={lineHeight} value="loose" /> Loose</label>
        </fieldset>
        <fieldset>
          <legend>Brand UI Type</legend>
          <label><input type="radio" bind:group={uiMode} value="buttons" /> Buttons</label>
          <label><input type="radio" bind:group={uiMode} value="inputs" /> Inputs</label>
          <label><input type="radio" bind:group={uiMode} value="cards" /> Cards</label>
        </fieldset>
      </div>
    </header>

    <nav class="table-tabs card" aria-label="Table selector">
      <button
        type="button"
        class:active={activeTable === "typography"}
        onclick={() => (activeTable = "typography")}
      >
        Typography Matrix
      </button>
      <button
        type="button"
        class:active={activeTable === "contrast"}
        onclick={() => (activeTable = "contrast")}
      >
        Foreground/Background Matrix
      </button>
      <button
        type="button"
        class:active={activeTable === "brand"}
        onclick={() => (activeTable = "brand")}
      >
        Brand Usage Matrix
      </button>
    </nav>

    {#if activeTable === "typography"}
      <section class="card table-block">
      <h2>Typography Matrix: Font Size x Font Weight</h2>
      <p>Rows are size tokens and columns are weight tokens. This table helps pick hierarchy pairings quickly.</p>
      <div class="table-wrap">
        <table class="matrix">
          <thead>
            <tr>
              <th>size \ weight</th>
              {#each fontWeights as weight}
                <th>{weight.label}</th>
              {/each}
            </tr>
          </thead>
          <tbody>
            {#each fontSizes as size}
              <tr>
                <th>{size.label}</th>
                {#each fontWeights as weight}
                  <td>
                    <div
                      class="typo-swatch"
                      style={`font-size: var(${size.varName}); font-weight: var(${weight.varName}); line-height: ${lineHeightVar()};`}
                    >
                      <div class="token-pair">{size.label} + {weight.label}</div>
                      <p>{sampleSentence}</p>
                      <button class="mini-btn" type="button">Inspect</button>
                    </div>
                  </td>
                {/each}
              </tr>
            {/each}
          </tbody>
        </table>
      </div>
      </section>
    {:else if activeTable === "contrast"}
      <section class="card table-block">
      <h2>Foreground/Background Matrix</h2>
      <p>Rows are background tokens and columns are foreground tokens. Each cell includes paragraph and filled input.</p>
      <div class="table-wrap">
        <table class="matrix">
          <thead>
            <tr>
              <th>background \ text</th>
              {#each textTokens as fg}
                <th>{fg.label}</th>
              {/each}
            </tr>
          </thead>
          <tbody>
            {#each bgTokens as bg}
              <tr>
                <th>{bg.label}</th>
                {#each textTokens as fg}
                  <td>
                    <div
                      class="contrast-swatch"
                      style={`background: var(${bg.varName}); color: var(${fg.varName}); line-height: ${lineHeightVar()};`}
                    >
                      <div class="token-pair">{bg.label} + {fg.label}</div>
                      <p>The quick contrast sample with real UI text and border treatment.</p>
                      <input type="text" value="Filled input sample" readonly />
                      <button type="button">Action</button>
                    </div>
                  </td>
                {/each}
              </tr>
            {/each}
          </tbody>
        </table>
      </div>
      </section>
    {:else}
      <section class="card table-block">
      <h2>Brand Usage Matrix</h2>
      <p>Rows are brand backgrounds and columns are foreground choices. The UI sample changes with the radio selection.</p>
      <div class="table-wrap">
        <table class="matrix">
          <thead>
            <tr>
              <th>brand bg \ content text</th>
              {#each brandFgTokens as fg}
                <th>{fg.label}</th>
              {/each}
            </tr>
          </thead>
          <tbody>
            {#each brandBgTokens as bg}
              <tr>
                <th>{bg.label}</th>
                {#each brandFgTokens as fg}
                  <td>
                    <div class="brand-swatch" style={`background: var(${bg.varName}); color: var(${fg.varName});`}>
                      <div class="token-pair">{bg.label} + {fg.label}</div>
                      <div class="brand-content">
                        {#if uiMode === "buttons"}
                          <button class="demo-btn" type="button">Primary</button>
                          <button class="demo-btn ghost" type="button">Secondary</button>
                        {:else if uiMode === "inputs"}
                          <label>
                            Label
                            <input type="text" value="Brand input text" readonly />
                          </label>
                          <button class="demo-btn" type="button">Submit</button>
                        {:else}
                          <article class="mini-card">
                            <div class="title-bar">Card Title</div>
                            <p>A compact card with title bar, body text, and an action button.</p>
                            <button class="demo-btn" type="button">Open</button>
                          </article>
                        {/if}
                      </div>
                      <div class="sample-meta">{uiSample(bg.varName, fg.varName)}</div>
                    </div>
                  </td>
                {/each}
              </tr>
            {/each}
          </tbody>
        </table>
      </div>
      </section>
    {/if}
  </div>
</div>

<style>
.viewport {
  width: 100%;
  height: 100%;
  overflow: auto;
  background: var(--surface-page);
}

.page {
  --demo-gap: var(--space-6);

  background: var(--surface-page);
  color: var(--text-primary);
  min-height: 100%;
  min-width: 1200px;
  padding: var(--space-7);
  display: grid;
  gap: var(--demo-gap);
}

.card {
  background: var(--surface-panel);
  border: 1px solid var(--border-subtle);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-sm);
}

.hero {
  display: grid;
  gap: var(--space-6);
  grid-template-columns: minmax(260px, 1.2fr) minmax(320px, 1fr);
  padding: var(--space-7);
}

h1,
h2,
p {
  margin: 0;
}

h1 {
  font-size: var(--font-size-xxl);
  font-weight: var(--font-weight-bold);
  line-height: var(--line-height-tight);
}

h2 {
  font-size: var(--font-size-lg);
  font-weight: var(--font-weight-bold);
}

.hero p,
.table-block > p {
  margin-top: var(--space-3);
  color: var(--text-secondary);
  line-height: var(--line-height-normal);
}

.controls {
  display: grid;
  gap: var(--space-4);
}

fieldset {
  border: 1px solid var(--border-default);
  border-radius: var(--radius-md);
  padding: var(--space-3) var(--space-4);
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-4);
}

legend {
  padding: 0 var(--space-2);
  color: var(--text-secondary);
  font-size: var(--font-size-sm);
}

label {
  display: inline-flex;
  align-items: center;
  gap: var(--space-2);
  font-size: var(--font-size-sm);
}

input[type="radio"] {
  accent-color: var(--interactive-primary-bg);
}

.table-block {
  padding: var(--space-6);
  display: grid;
  gap: var(--space-4);
}

.table-tabs {
  padding: var(--space-3);
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-3);
}

.table-tabs button {
  background: var(--color-bg-3);
  color: var(--color-text-hi-con);
  border-color: var(--color-border-default);
}

.table-tabs button.active {
  background: var(--color-flip-bg-3);
  color: var(--color-flip-text-hi-con);
  border-color: var(--color-flip-border-default);
}

.table-wrap {
  overflow: auto;
  border-radius: var(--radius-md);
  border: 1px solid var(--border-subtle);
}

.matrix {
  width: 100%;
  border-collapse: collapse;
  min-width: 980px;
}

.matrix th,
.matrix td {
  border: 1px solid var(--border-subtle);
  padding: var(--space-2);
  vertical-align: top;
}

.matrix thead th {
  position: sticky;
  top: 0;
  background: var(--surface-elevated);
  z-index: 1;
  text-transform: uppercase;
  letter-spacing: 0.02em;
  font-size: var(--font-size-xs);
}

.matrix tbody th {
  background: var(--surface-elevated);
  font-size: var(--font-size-xs);
  color: var(--text-secondary);
}

.typo-swatch,
.contrast-swatch,
.brand-swatch {
  border: 1px solid var(--border-subtle);
  border-radius: var(--radius-md);
  padding: var(--space-3);
  min-height: 150px;
  display: grid;
  align-content: start;
  gap: var(--space-2);
}

.typo-swatch {
  background: var(--surface-page);
  color: var(--text-primary);
}

.token-pair {
  font-size: var(--font-size-xs);
  font-weight: var(--font-weight-medium);
  opacity: 0.86;
}

.typo-swatch p,
.contrast-swatch p,
.brand-swatch p {
  margin: 0;
}

.contrast-swatch input,
.brand-swatch input {
  width: 100%;
  box-sizing: border-box;
  border-radius: var(--radius-sm);
  border: 1px solid color-mix(in srgb, currentcolor 40%, transparent);
  background: color-mix(in srgb, currentcolor 8%, transparent);
  color: inherit;
  padding: var(--space-2) var(--space-3);
}

button {
  border-radius: var(--radius-sm);
  border: 1px solid color-mix(in srgb, currentcolor 40%, transparent);
  background: transparent;
  color: inherit;
  padding: var(--space-2) var(--space-3);
  cursor: pointer;
}

.mini-btn {
  justify-self: start;
}

.brand-content {
  display: grid;
  gap: var(--space-3);
}

.demo-btn {
  background: color-mix(in srgb, currentcolor 10%, transparent);
}

.demo-btn.ghost {
  background: transparent;
}

.mini-card {
  border: 1px solid color-mix(in srgb, currentcolor 35%, transparent);
  border-radius: var(--radius-sm);
  overflow: hidden;
  background: color-mix(in srgb, currentcolor 8%, transparent);
}

.title-bar {
  background: color-mix(in srgb, currentcolor 22%, transparent);
  padding: var(--space-2) var(--space-3);
  font-weight: var(--font-weight-bold);
}

.mini-card p {
  padding: var(--space-3);
}

.mini-card .demo-btn {
  margin: 0 var(--space-3) var(--space-3);
}

.sample-meta {
  font-size: var(--font-size-xs);
  opacity: 0.8;
}

@media (max-width: 980px) {
  .page {
    min-width: 960px;
    padding: var(--space-5);
  }

  .hero {
    grid-template-columns: 1fr;
  }
}
</style>
