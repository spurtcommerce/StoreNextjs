import { getAdapterInstance } from "./adapter.registry.js";

/**
 * Returns the configured AddressAdapter instance dynamically
 * @returns {any}
 */
export function getAddressAdapter() {
  return getAdapterInstance("address");
}

export default getAddressAdapter;
