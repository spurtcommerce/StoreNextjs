import { getAdapterInstance } from "./adapter.registry.js";

/**
 * Returns the configured OrderAdapter instance dynamically
 * @returns {any}
 */
export function getOrderAdapter() {
  return getAdapterInstance("order");
}

export default getOrderAdapter;
