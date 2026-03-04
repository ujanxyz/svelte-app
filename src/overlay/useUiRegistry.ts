import type { OverlaySnippet } from "./types";

const registry = (function _makeUiRegistry() {
    const registry: Map<string, OverlaySnippet> = new Map();

    function registerUI(key: string, ui: OverlaySnippet): void {
        if (registry.has(key)) {
            throw new Error("dup key: " + key);
        }
        registry.set(key, ui);
    }

    function getUI(key: string): OverlaySnippet | undefined {
        return registry.get(key);
    }

    return {registerUI, getUI};
})();

export default function useUiRegistry() {
    return registry;
}
