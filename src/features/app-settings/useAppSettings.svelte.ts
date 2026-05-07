import { derived, type Readable, writable } from "svelte/store";

type AppTheme = "light" | "dark";

interface AppSettingsStore {
  isDarkTheme: Readable<boolean>;
  setAppTheme: (theme: AppTheme) => void;
  toggleAppTheme: () => void;
}

function detectInitialTheme(): AppTheme {
  if (typeof window === "undefined" || typeof window.matchMedia !== "function") {
    return "light";
  }
  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

function createAppSettingsStore(): AppSettingsStore {
  let appTheme = writable<AppTheme>(detectInitialTheme());
  const isDarkTheme = derived(appTheme, ($appTheme) => $appTheme === "dark");

  function setAppTheme(theme: AppTheme): void {
    appTheme.set(theme);
  }

  function toggleAppTheme(): void {
    appTheme.update((current) => (current === "light" ? "dark" : "light"));
  }

  appTheme.subscribe((theme) => {
    theme;
    if (typeof document !== "undefined") {
      document.documentElement.setAttribute("data-theme", theme);
    }
  });


  return { isDarkTheme, setAppTheme, toggleAppTheme };
}

const appSettingsStore = createAppSettingsStore();

export type { AppSettingsStore, AppTheme };

export function useAppSettings(): AppSettingsStore {
  return appSettingsStore;
}
