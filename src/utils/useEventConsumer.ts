import { getContext } from "svelte";

type PayloadFunction = (payload: any) => void;
type CustomEventHandler = (ev: Event) => void;

type AsyncPayloadFunction = (payload: any) => Promise<void>;
type AsyncCustomEventHandler = (ev: Event) => Promise<void>;

function useEventConsumer() {
  const target = getContext(Symbol.for(EventTarget.name)) as EventTarget;
  const cleanups: { kind: string; handler: CustomEventHandler | AsyncCustomEventHandler }[] = [];

  function handleEvent(kind: string, fn: PayloadFunction): void {
    const handler: CustomEventHandler = (ev: Event) => {
      const payload = (ev as CustomEvent).detail as any;
      fn(payload);
    };
    target.addEventListener(kind, handler);
    cleanups.push({ kind, handler });
  }

  function handleEventAsync(kind: string, fn: AsyncPayloadFunction): void {
    const handler: AsyncCustomEventHandler = async (ev: Event): Promise<void> => {
      const payload = (ev as CustomEvent).detail as any;
      await fn(payload);
    };
    target.addEventListener(kind, handler);
    cleanups.push({ kind, handler });
  }

  function clearHandlers(): void {
    for (const { kind, handler } of cleanups) {
      target.removeEventListener(kind, handler);
    }
  }

  return { handleEvent, handleEventAsync, clearHandlers };
}

export default useEventConsumer;
