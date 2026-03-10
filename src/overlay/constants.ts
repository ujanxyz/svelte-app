export const LAYER_CONTEXT_KEY = Symbol("layer");

export const ReturnStatus = Object.freeze({
  OK: "OK",
  SELF_ABORTED: "ABORTED_BY_SELF",
  BULK_ABORTED: "ABORTED_BY_DESELECT",
  PARENT_ABORTED: "ABORTED_BY_PARENT",
});
