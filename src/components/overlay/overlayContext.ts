import { getContext, setContext } from "svelte";
import type { DisplayStateSetter, OverlayDisplayState } from "./types";

interface OverlayProviderUse {
    setContainer(view: HTMLDivElement): void;
};

interface OverlayConsumerUse {
    showAtTarget(uiName: string, clientXY: [number, number]): void;
    showAtTop(uiName: string): void;
};

const CONTEXT_KEY = Symbol("overlay");

function _makeContext(stateSetter: DisplayStateSetter): OverlayProviderUse & OverlayConsumerUse {
    let container: HTMLDivElement | undefined;

    function setContainer(view: HTMLDivElement) {
        container = view;
    }

    function showAtTarget(uiName: string, clientXY: [number, number]): void {
        if (!container) return;
        const rect = container.getBoundingClientRect();
        const left = clientXY[0] - rect.left;
        const top = clientXY[1] - rect.top;
        const state: OverlayDisplayState = {uiName, mode: "ctx", left, top};
        stateSetter(state);
    }

    function showAtTop(uiName: string): void {
        if (!container) return;
        console.log("Gallery ... from top ⚡️ = " + uiName);
        const state: OverlayDisplayState = {uiName, mode: "top"};
        stateSetter(state);
    }

    return {setContainer, showAtTarget, showAtTop};
}

function useOverlayProvider(stateSetter: DisplayStateSetter): OverlayProviderUse {
    const context = _makeContext(stateSetter);
    setContext<OverlayConsumerUse>(CONTEXT_KEY, context);
    return context;
}

function useOverlayConsumer(): OverlayConsumerUse {
    const context = getContext<OverlayConsumerUse>(CONTEXT_KEY);
    console.assert(!!context);
    return context;
}

export {useOverlayProvider, useOverlayConsumer};