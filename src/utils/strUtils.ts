export interface AssetUriParts {
  scheme: string;
  store: string;
  id: string;
}

/**
 * Parse asset URIs of the form:
 *   - idb:/<store>/<id>  (preferred)
 *   - idb:/<store>:<id>  (legacy fallback)
 */
export function parseAssetUri(assetUri: string): AssetUriParts | null {
  if (!assetUri || typeof assetUri !== "string") {
    return null;
  }

  let match = assetUri.match(/^([A-Za-z0-9_]+):\/([^/:]+)\/(.+)$/);
  if (match) {
    const [, scheme, store, id] = match;
    return { scheme, store, id };
  }

  match = assetUri.match(/^([A-Za-z0-9_]+):\/([^/:]+):(.+)$/);
  if (match) {
    const [, scheme, store, id] = match;
    return { scheme, store, id };
  }

  return null;
}
