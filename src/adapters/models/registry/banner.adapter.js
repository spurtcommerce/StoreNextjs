import { getAdapterInstance } from "./adapter.registry.js";

/**
 * Returns the BannerAdapter for the currently active commerce backend.
 * Provides unified banner fetching matching the Spurt banner pattern.
 */
export function getBannerAdapter() {
  return getAdapterInstance("banner");
}

export default getBannerAdapter;
