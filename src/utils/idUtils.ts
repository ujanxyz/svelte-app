const isCryptoAvailable = typeof crypto !== "undefined" && typeof crypto.randomUUID === "function";

/**
 * Generate a short id using randomUUID when available, with a prefix for readability.
 */
export function generateShortId(prefix: string, length: number = 12): string {
  const base = isCryptoAvailable
    ? crypto.randomUUID().replace(/-/g, "")
    : Math.random().toString(36).slice(2) + Date.now().toString(36);
  return `${prefix}_${base.slice(0, length)}`;
}

/**
 * Given a handle id of the form "slotName/in" or "slotName/out", return the original
 * slot name.
 */
export function handleToSlotName(handleName: string): string {
  // Search the position of the last "/"
  const lastSlashIndex = handleName.lastIndexOf("/");
  if (lastSlashIndex !== -1) {
    return handleName.substring(0, lastSlashIndex);
  }
  return handleName;
}