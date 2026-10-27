import { getAdapterInstance } from "./adapter.registry.js";

/**
 * Returns the configured CategoryListAdapter instance dynamically
 * @returns {any}
 */
export function getCategoryListAdapter() {
  return getAdapterInstance("category");
}

export default getCategoryListAdapter;
