import store from "./store";
import type { ToastEntry, ToastType } from "./types";

function useToast() {
  function showToast(type: ToastType, message: string) {
    // toastContext.creator?.show(message);
    store.updateNow();
    const id = crypto.randomUUID();
    const startedAt = store.getNow();
    const t = { id, type, message, startedAt } as ToastEntry;
    store.pushToast(t);
  }

  return { showToast };
}

export default useToast;
