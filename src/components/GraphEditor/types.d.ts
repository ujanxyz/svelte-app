interface TopLeftPosition {
  top: number;
  left: number;
};

interface NodeContext {
  addSlot(slotDiv: HTMLDivElement, topLeft: TopLeftPosition): void;
};

export type { NodeContext, TopLeftPosition};