import { getContext, setContext } from "svelte";

function useNewEventTarget(): void {
    const ctxKey = Symbol.for(EventTarget.name);
    const prev = getContext(ctxKey);
    console.assert(!prev, "Old context exists", prev);
    setContext(ctxKey, new EventTarget());
}

export default useNewEventTarget;
