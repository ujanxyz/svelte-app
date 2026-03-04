<script lang="ts">
import logo from "../assets/svelte.svg";
import { OverlayProvider } from "../overlay";
import WasmTester from "../modules/engine/WasmTester.svelte";
import PropsPanelMain from "../graph/propspanel/PropsPanelMain.svelte";
import ContentSelector from "./ContentSelector.svelte";
import XYFlowGraph from "../graph/xyflow/XYFlowGraph.svelte";
</script>

<OverlayProvider>
  <div class="screen">
    <header id="pageHeader">
      <img src={logo} class="logo" alt="Vite Logo" />
      <ContentSelector />
    </header>
    <article id="mainArticle">
      <XYFlowGraph />
    </article>
    <nav id="mainNav" class="elevation-1">
      <WasmTester />
    </nav>
    <div id="siteAds">
      <PropsPanelMain />
    </div>
    <footer id="pageFooter">Footer</footer>
  </div>
</OverlayProvider>

<style>
img {
  width: 1.5rem;
  height: 1.5rem;
}
.screen {
  margin: 0;
  padding: 0;
  width: 100vw;
  height: 100dvh;
  border: 1px solid #444;

  display: grid;
  grid-template-areas:
    "header header header"
    "nav article ads"
    "nav footer footer";
  grid-template-rows: 30px 1fr 50px;
  grid-template-columns: 35% 1fr 35%; /* 15% */
  grid-row-gap: 1px;
  grid-column-gap: 1px;
  background-color: #444;
}

header,
footer,
article,
nav,
div {
  margin: 0;
  padding: 0;
  background: var(--color-bg-app);
  overflow: hidden;
}
#pageHeader {
  grid-area: header;

  display: flex;
}
#pageFooter {
  grid-area: footer;
}
#mainArticle {
  grid-area: article;
  overflow-y: scroll;
}
#mainNav {
  grid-area: nav;
}
#siteAds {
  grid-area: ads;
}
/* Stack the layout on small devices/viewports. */
@media all and (max-width: 575px) {
  .screen {
    grid-template-areas:
      "header"
      "article"
      "ads"
      "nav"
      "footer";
    grid-template-rows: 80px 1fr 250px 1fr 70px;
    grid-template-columns: 1fr;
  }
}
</style>
