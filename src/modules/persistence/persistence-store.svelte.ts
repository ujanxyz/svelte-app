interface AppData {
  version: string;
  lastsaved: number;
  featuredata: Record<string, object>;
}

const APP_VERSION = "1.0.0";
const STORAGE_KEY = "svelte-app:v1";

function shallowCopy(appData: AppData | null): AppData | null {
  if (!appData) return appData;
  const { version, lastsaved, featuredata } = appData;
  const { ...records } = featuredata;
  return { version, lastsaved, featuredata: { ...records } };
}

function loadProject(): AppData | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch (err) {
    console.warn("Failed loading project", err);
    return null;
  }
}

function saveProject(doc: AppData) {
  try {
    const json = JSON.stringify(doc);
    localStorage.setItem(STORAGE_KEY, json);
  } catch (err) {
    console.warn("Failed saving project", err);
  }
}

function makePersistenceStore() {
  let loadedAppData: AppData | null = loadProject();
  console.log("@loadedAppData == ", loadedAppData);

  const appdata: AppData = shallowCopy(loadedAppData) ?? {
    version: APP_VERSION,
    lastsaved: 0,
    featuredata: {},
  };

  let timer: number | null = null;

  function createValueReader(key: string): () => object | null {
    return (): object | null => {
      if (loadedAppData === null) return null;
      return loadedAppData.featuredata[key] ?? null;
    };
  }

  function createValueUpdater(key: string) {
    appdata.featuredata || (appdata.featuredata = {});
    return (snapshot: object) => {
      appdata.featuredata[key] = snapshot;
      scheduleSave();
    };
  }

  function scheduleSave() {
    if (timer) clearTimeout(timer);
    timer = window.setTimeout(triggerSave, 1200);
  }

  function triggerSave() {
    appdata.lastsaved = Date.now();
    saveProject(appdata);
    console.log("Saved data !");
  }

  return { createValueReader, createValueUpdater };
}

export { makePersistenceStore };

