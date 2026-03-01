<script lang="ts">
  import { onDestroy, onMount } from "svelte";
  import wasmService from "./wasmService";
  import type { HelloClassInstance } from "../types/WasmModule";
  import { graphStore } from "./graphStore";
  import OutlinedSvgIcon from "../libs/OutlinedSvgIcon.svelte";
  import MultiWordsInput from "../libs/MultiWordsInput.svelte";
  import TextButton from "../libs/TextButton.svelte";

  let graphApi: HelloClassInstance | null = null;

  const unsubscribe = graphStore.subscribe(graph => {
    console.log("Graph state updated:", graph);
  });

    onMount(async () => {
    graphApi = await wasmService.getGraphModule();
    console.log("Graph API from WASM:", graphApi);
    graphApi.sayHello();

  });

  onDestroy(() => {
    console.log("Cleanup Graph API from WASM:", graphApi);
    unsubscribe();
  });

  let entriesAddNode = $state<Map<string, string>>(
    new Map([
      ["Function#:", ""],
    ])
  );


  let entriesInsertEdge = $state<Map<string, string>>(
    new Map([
      ["Src Node#:", ""],
      ["Src Slot#:", ""],
      ["Dest Node#:", ""],
      ["Dest Slot#:", ""],
    ])
  );

  let entriesDeleteNode = $state<Map<string, string>>(
    new Map([
      ["Node#:", ""],
    ])
  );

  let entriesDeleteEdge = $state<Map<string, string>>(
    new Map([
      ["Edge#:", ""],
    ])
  );

    // ---------------------------
    // HELPERS
    // ---------------------------

    function randomSlotName(): string {
        const chars = "abcdefghijklmnopqrstuvwxyz";
        const len = Math.floor(Math.random() * 5) + 3;
        let s = "";
        for (let i = 0; i < len; i++) {
            s += chars[Math.floor(Math.random() * chars.length)];
        }
        return s;
    }

    function generateRandomSlots(maxCount: number): string[] {
        const count = Math.floor(Math.random() * (maxCount + 1));
        const slots: string[] = [];
        for (let i = 0; i < count; i++) {
            slots.push(randomSlotName());
        }
        return slots;
    }

    // ---------------------------
    // HANDLERS
    // ---------------------------

    function handleAddNode() {
        const inputSlots = generateRandomSlots(2);
        const outputSlots = generateRandomSlots(2);
        console.log("ADD NODE");
        console.log({
            functionName: entriesAddNode.get("Function#:"),
            inputSlots,
            outputSlots
        });
        // TODO: call backend
        // const nodeId = graphStore.addNode(
        //     addFunctionName,
        //     inputSlots,
        //     outputSlots
        // );
    }

    function handleInsertEdge() {
        console.log("INSERT EDGE");
        console.log({
            srcNodeId: entriesInsertEdge.get("Src Node#:"),
            srcSlot: entriesInsertEdge.get("Src Slot#:"),
            dstNodeId: entriesInsertEdge.get("Dest Node#:"),
            dstSlot: entriesInsertEdge.get("Dest Slot#:"),
        });
        // TODO: call backend
        // const edgeId = await graph.insertEdge(...)

    }

    function handleDeleteNode() {
        console.log("DELETE NODE");
        console.log({
            nodeId: entriesDeleteNode.get("Node#:"),
        });
        // TODO: call backend

    }

    function handleDeleteEdge() {
        console.log("DELETE EDGE");
        console.log({
            edgeId: entriesDeleteEdge.get("Edge#:"),
        });
        // TODO: call backend
    }

    function handleDeleteGraph() {
        console.log("DELETE GRAPH");
        // TODO: call backend
    }


</script>

<div class="container">
    <h2>Graph API Tester</h2>

<hr/>

<!-- Add Node -->
<section>
    <MultiWordsInput entries={entriesAddNode} />
    <br/>
    <TextButton text="Add Node" onclick={handleAddNode}/>
</section>

<hr/>

<!-- Insert Edge -->
<section>
    <MultiWordsInput entries={entriesInsertEdge} />
    <br/>
    <TextButton text="Insert Edge" onclick={handleInsertEdge}/>
    <OutlinedSvgIcon />
</section>

<hr/>


<!-- Delete Node -->
<section>
    <MultiWordsInput entries={entriesDeleteNode} />
    <br/>
    <TextButton text="Delete Node" onclick={handleDeleteNode}/>
</section>

<hr/>

<!-- Delete Edge -->
<section>
    <MultiWordsInput entries={entriesDeleteEdge} />
    <br/>
    <TextButton text="Delete Edge" onclick={handleDeleteEdge}/>
</section>

<hr/>

<!-- Delete Graph -->
<section>
  <TextButton text="Delete Graph" onclick={handleDeleteGraph}/>
</section>

</div>

<style>
.container {
  margin: 0;
  padding: 0;
}
section {
  margin: 0;
  padding: var(--space-1);
}
</style>