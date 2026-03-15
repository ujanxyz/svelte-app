import { makePersistenceStore } from "./persistence-store.svelte";

export default function useAppLocalData<T extends object>(
  key: string,
  appDataGetter: () => T | null,
) {
  const persistenceStore = makePersistenceStore();
  const reader = persistenceStore.createValueReader(key);
  const updater = persistenceStore.createValueUpdater(key);

  function getLoadedData(): T | null {
    const readValue = reader();
    return readValue as T | null;
  }

  function signalUpdate() {
    const snapshot = appDataGetter();
    if (snapshot !== null) {
      updater(snapshot);
    }
  }

  return { getLoadedData, signalUpdate };
}
