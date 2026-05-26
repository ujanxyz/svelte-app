export type OverlayMode = "deselected" | "highlight" | "transform";

export interface OverlaySnapshot {
  mode: OverlayMode;
  hoveredIds: string[];
  selectedId: string | null;
}

/**
 * Small interaction state machine for editor overlays:
 * - deselected: no hovered, no selected
 * - highlight: one or more hovered, no selected
 * - transform: exactly one selected, hover suppressed
 */
export class OverlayStateMachine {
  #hoveredIds: string[] = [];
  #selectedId: string | null = null;

  get snapshot(): OverlaySnapshot {
    return {
      mode: this.#mode(),
      hoveredIds: [...this.#hoveredIds],
      selectedId: this.#selectedId,
    };
  }

  pointerMove(hitId: string | null): OverlaySnapshot {
    if (this.#selectedId) {
      // Transform mode suppresses hover visuals.
      this.#hoveredIds = [];
      return this.snapshot;
    }

    this.#hoveredIds = hitId ? [hitId] : [];
    return this.snapshot;
  }

  pointerDown(hitId: string | null): OverlaySnapshot {
    this.#hoveredIds = [];
    this.#selectedId = hitId;
    return this.snapshot;
  }

  clearSelection(): OverlaySnapshot {
    this.#selectedId = null;
    return this.snapshot;
  }

  setSelected(id: string | null): OverlaySnapshot {
    this.#selectedId = id;
    if (id) this.#hoveredIds = [];
    return this.snapshot;
  }

  #mode(): OverlayMode {
    if (this.#selectedId) return "transform";
    if (this.#hoveredIds.length > 0) return "highlight";
    return "deselected";
  }
}
