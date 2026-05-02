/// <reference types="svelte" />

declare module "*.svg" {
  const content: string;
  export default content;
}

declare module "*.css";

declare module "svelte-filepond" {
  import type { SvelteComponentTyped } from "svelte";

  export default class FilePond extends SvelteComponentTyped<Record<string, unknown>> {}
}
