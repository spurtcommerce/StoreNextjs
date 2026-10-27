import { getAdapterInstance } from "./adapter.registry.js";

/**
 * Returns the configured CartAdapter instance dynamically
 * @returns {any}
 */
export function getCartAdapter() {
  return getAdapterInstance("cart");
}

export default getCartAdapter;
