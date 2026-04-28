import { overlayStatuses } from "./constants";
import type { OverlayAbortStatus } from "./types";

function getMessage(status: OverlayAbortStatus): string {
  switch (status) {
    case overlayStatuses.ABORTED:
      return "Overlay aborted";
    case overlayStatuses.DISMISSED:
      return "Overlay dismissed";
    case overlayStatuses.PARENT_ABORTED:
      return "Overlay aborted by parent";
  }
}

export class OverlayAbortError extends Error {
  readonly status: OverlayAbortStatus;

  constructor(status: OverlayAbortStatus, message = getMessage(status)) {
    super(message);
    this.name = "OverlayAbortError";
    this.status = status;
  }
}

export function isOverlayAbortError(
  reason: unknown,
): reason is OverlayAbortError {
  return reason instanceof OverlayAbortError;
}