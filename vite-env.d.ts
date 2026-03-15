/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_URL: string;
  readonly VITE_APP_TITLE: string;
  readonly VITE_FLAG_ENABLE_LOCAL_STORAGE: string;
  readonly VITE_FLAG_DEBUG_GRAPH_INSPECTOR: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
