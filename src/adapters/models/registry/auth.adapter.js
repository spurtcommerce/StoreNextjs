import { getAdapterInstance } from "./adapter.registry.js";

/**
 * Returns the configured AuthAdapter instance dynamically
 * @returns {any}
 */
export function getAuthAdapter() {
  return getAdapterInstance("auth");
}

export default getAuthAdapter;
