import { getContext } from "svelte";

type PayloadFunction = (payload: any) => void;
type CustomEventHandler = (ev: Event) => void;

function useEventConsumer() {
    const target = getContext(Symbol.for(EventTarget.name)) as EventTarget;
    const cleanup: {kind: string, handler: CustomEventHandler}[] = [];

    function handleEvent(kind: string, fn: PayloadFunction): void {
      const handler: CustomEventHandler = (ev: Event) => {
        const payload = (ev as CustomEvent).detail as any;
        fn(payload);
      };
      target.addEventListener(kind, handler);
      cleanup.push({kind, handler});
    }

    function clearHandlers(): void {
      for (const {kind, handler} of cleanup) {
        target.removeEventListener(kind, handler);
      }
    }

    return {handleEvent, clearHandlers};
}

export default useEventConsumer;
