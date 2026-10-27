import { getAdapterInstance } from "./adapter.registry.js";

/**
 * Returns the configured PaymentAdapter instance dynamically
 * @returns {any}
 */
export function getPaymentAdapter() {
  return getAdapterInstance("payment");
}

export default getPaymentAdapter;
