import { getContext } from "svelte";

function useEventDispatch(eventKind: string) {
    const target = getContext(Symbol.for(EventTarget.name)) as EventTarget;
    return function dispatch(payload: any) {
        const event = new CustomEvent(eventKind, {
            detail: payload,
            bubbles: false,
        });
        target.dispatchEvent(event);
    }
}

export default useEventDispatch;
