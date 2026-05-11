import { derived, type Readable, writable } from "svelte/store";

type AppTheme = "light" | "dark";

interface AppSettings {
  theme: AppTheme;
}

const LOCAL_STORAGE_ENABLED = import.meta.env.VITE_FLAG_ENABLE_LOCAL_STORAGE === "true";
const APP_SETTINGS_STORAGE_KEY = "svelte-app:app-settings:v1";

interface AppSettingsStore {
  isDarkTheme: Readable<boolean>;
  setAppTheme: (theme: AppTheme) => void;
  toggleAppTheme: () => void;
}

function _detectInitialTheme(): AppTheme {
  const persisted = _readStoredSettings();
  if (persisted?.theme) {
    return persisted.theme;
  }
  if (typeof window === "undefined" || typeof window.matchMedia !== "function") {
    return "light";
  }
  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

function _readStoredSettings(): AppSettings | null {
  if (!LOCAL_STORAGE_ENABLED || typeof window === "undefined") {
    return null;
  }

  try {
    const raw = localStorage.getItem(APP_SETTINGS_STORAGE_KEY);
    if (!raw) {
      return null;
    }
    const parsed = JSON.parse(raw) as Partial<AppSettings>;
    if (parsed.theme === "light" || parsed.theme === "dark") {
      return { theme: parsed.theme };
    }
    return null;
  } catch (error) {
    console.warn("Failed to read app settings from localStorage", error);
    return null;
  }
}

function _writeStoredSettings(settings: AppSettings): void {
  if (!LOCAL_STORAGE_ENABLED || typeof window === "undefined") {
    return;
  }

  try {
    localStorage.setItem(APP_SETTINGS_STORAGE_KEY, JSON.stringify(settings));
  } catch (error) {
    console.warn("Failed to write app settings to localStorage", error);
  }
}

function _createAppSettingsStore(): AppSettingsStore {
  let appTheme = writable<AppTheme>(_detectInitialTheme());
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

    const prior = _readStoredSettings() ?? { theme };
    _writeStoredSettings({
      ...prior,
      theme,
    });
  });

  return { isDarkTheme, setAppTheme, toggleAppTheme };
}

const appSettingsStore = _createAppSettingsStore();

export type { AppSettings, AppSettingsStore, AppTheme };

export function useAppSettings(): AppSettingsStore {
  return appSettingsStore;
}
