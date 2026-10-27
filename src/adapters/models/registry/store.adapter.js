import { getAdapterInstance } from "./adapter.registry.js";

/**
 * Returns the configured StoreAdapter instance dynamically
 * @returns {any}
 */
export function getStoreAdapter() {
  return getAdapterInstance("store");
}

export default getStoreAdapter;
