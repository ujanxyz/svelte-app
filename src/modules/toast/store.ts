import { get, writable } from "svelte/store";

import type { ToastEntry } from "./types";

const MAX_TOASTS_COUNT = 10;

const store = (function () {
  const toasts = writable<ToastEntry[]>([]);
  const timeNow = writable<number>(Date.now());

  function pushToast(entry: ToastEntry) {
    toasts.update((n) => [entry, ...n].slice(0, MAX_TOASTS_COUNT));
  }

  function rmToast(toastId: string) {
    toasts.update((n) => n.filter((t: ToastEntry) => t.id !== toastId));
  }

  function getNow(): number {
    return get(timeNow);
  }

  function updateNow() {
    timeNow.set(Date.now());
  }

  return {
    pushToast,
    rmToast,
    getNow,
    updateNow,
    subscribeToasts: toasts.subscribe,
    subscribeNow: timeNow.subscribe,
  };
})();

export default store;
