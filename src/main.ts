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

const app = mount(App, {
  target: document.getElementById("app") as HTMLElement,
});

export default app;
