export interface AssetUriParts {
  scheme: string;
  store: string;
  id: string;
}

/**
 * Parse asset URIs of the form:
 *   - idb:/<store>/<id>
 */
export function parseAssetUri(assetUri: string): AssetUriParts | null {
  if (!assetUri || typeof assetUri !== "string") {
    console.warn("Invalid asset URI:", assetUri);
    return null;
  }

  let match = assetUri.match(/^([A-Za-z0-9_]+):\/([^/:]+)\/(.+)$/);
  if (match) {
    const [, scheme, store, id] = match;
    return { scheme, store, id };
  }

  return null;
}

/**
 * Constructs an asset URI for an artifact stored in IndexedDB, given its node ID.
 * @param nodeId The ID of the node representing the artifact.
 * @returns The constructed asset URI.
 */
export function makeArtifactUri(nodeId: string): string {
  return `idb:/artifacts/${nodeId}`;
}

/**
 * Constructs an asset URI for a media item stored in IndexedDB, given its node ID.
 * @param nodeId The ID of the node representing the media item.
 * @returns The constructed asset URI.
 */
export function makeMediaUri(nodeId: string): string {
  return `idb:/media/${nodeId}`;
}