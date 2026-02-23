import { getContext, setContext } from "svelte";
import type { DisplayStateSetter, OverlayDisplayState } from "./types";

interface OverlayProviderUse {
    setContainer(view: HTMLDivElement): void;
};

interface OverlayConsumerUse {
    showAsCtxMenu(trigger: string, event: MouseEvent, payload: any): void;
    showAtTop(trigger: string, payload: any): void;
};

const CONTEXT_KEY = Symbol("overlay");

function _makeContext(stateSetter: DisplayStateSetter): OverlayProviderUse & OverlayConsumerUse {
    let container: HTMLDivElement | undefined;

    function setContainer(view: HTMLDivElement) {
        container = view;
    }

    function showAsCtxMenu(trigger: string, event: MouseEvent, payload: any): void {
        event.preventDefault();
        if (!container) return;
        const {clientX, clientY} = event;
        const rect = container.getBoundingClientRect();
        const topLeft: [number, number] = [clientY - rect.top, clientX - rect.left];
        const state: OverlayDisplayState = {trigger, topLeft, payload};
        stateSetter(state);
    }

    function showAtTop(trigger: string, payload: any): void {
        console.log("Gallery ... from top ⚡️ = " + trigger);
        const state: OverlayDisplayState = {trigger, payload};
        stateSetter(state);
    }

    return {setContainer, showAsCtxMenu, showAtTop};
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