export const LAYER_CONTEXT_KEY = Symbol("layer");

export const ReturnStatus = Object.freeze({
  OK: "OK",
  SELF_ABORTED: "SELF_ABORTED",
  PARENT_ABORTED: "PARENT_ABORTED",
});
