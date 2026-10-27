import { getAdapterInstance } from "./adapter.registry.js";

/**
 * Returns the configured CheckoutAdapter instance dynamically
 * @returns {any}
 */
export function getCheckoutAdapter() {
  return getAdapterInstance("checkout");
}

export default getCheckoutAdapter;
