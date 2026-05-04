/**
 * @typedef {object} StagedImageEntry
 * @property {string} assetUri
 * @property {ImageData} bitmap
 */

/**
 * Temporary in-worker staging for bitmaps that are prepared for WASM input.
 * Entries are keyed by slot id and store both the source asset URI and ImageData.
 */
class AssetStaging {
  constructor() {
    /** @type {Map<string, StagedImageEntry>} */
    this._entriesBySlot = new Map();
  }

  /**
   * Stage a bitmap for a specific slot.
   *
   * @param {string} slotIdStr A string id specifying the expected consuming slot.
   * @param {string} assetUri The URI of the backing asset.
   * @param {ImageData} bitmap The ImageData to be staged.
   * @returns {void}
   */
  stageImageData(slotIdStr, assetUri, bitmap) {
    if (typeof slotIdStr !== "string" || slotIdStr.trim() === "") {
      throw new Error("stageImageData: slotIdStr must be a non-empty string");
    }
    if (typeof assetUri !== "string" || assetUri.trim() === "") {
      throw new Error("stageImageData: assetUri must be a non-empty string");
    }
    if (!(bitmap instanceof ImageData)) {
      throw new Error("stageImageData: bitmap must be an ImageData instance");
    }

    this._entriesBySlot.set(slotIdStr, { assetUri, bitmap });
  }

  /**
   * Release the bitmap staged for the slot and verify it came from the expected asset URI.
   *
   * @param {string} slotIdStr A string id specifying the expected consuming slot.
   * @param {string} assetUri The URI of the backing asset expected for this slot.
   * @returns {ImageData | null} Released bitmap when found+verified, else null when no slot is staged.
   */
  releaseImageData(slotIdStr, assetUri) {
    const entry = this._entriesBySlot.get(slotIdStr);
    if (!entry) {
      return null;
    }

    if (entry.assetUri !== assetUri) {
      throw new Error(
        `releaseImageData: asset URI mismatch for slot '${slotIdStr}'. ` +
          `Expected '${entry.assetUri}', got '${assetUri}'.`,
      );
    }

    this._entriesBySlot.delete(slotIdStr);
    return entry.bitmap;
  }

  /**
   * Clear all staged assets, e.g. on graph reset or worker shutdown.
   *
   * @returns {void}
   */
  clearAssets() {
    this._entriesBySlot.clear();
  }
}

export { AssetStaging };
