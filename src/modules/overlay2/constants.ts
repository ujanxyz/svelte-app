export const overlayStatuses = {
  OK: "ok",
  ABORTED: "aborted",
  DISMISSED: "dismissed",
  PARENT_ABORTED: "parent-aborted",
} as const;

export const defaultOverlayOptions = {
  dismissOnBackdrop: true,
  dismissOnEscape: true,
  closeOnWindowResize: false,
} as const;

export const OVERLAY_MANAGER_CONTEXT = Symbol("overlay-manager");
export const OVERLAY_INSTANCE_CONTEXT = Symbol("overlay-instance");