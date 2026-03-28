import { mount } from "svelte";

import App from "./app/App.svelte";

const context = (function () {
  const ctx: Map<any, any> = new Map();
  return ctx;
})();

const target = document.getElementById("app") as HTMLDivElement;
const app = mount(App, { target, context });

export default app;
