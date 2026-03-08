import { mount } from "svelte";
import App from "./app/App.svelte";
import wasmService from "./modules/engine/wasmService";

let start = Date.now();
wasmService
  .initialize()
  .then(() => {
    let end = Date.now();
    console.log(`WASM service initialized in ${end - start} ms`);
  })
  .catch((error) => {
    console.error("Failed to initialize WASM service:", error);
  });


const context = (function() {
  const ctx: Map<any, any> = new Map();
  return ctx;
})();

const target = document.getElementById("app") as HTMLDivElement;
const app = mount(App, { target, context });

export default app;
