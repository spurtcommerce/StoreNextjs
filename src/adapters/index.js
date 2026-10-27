export * from "./models/index.js";

import { getAdapterInstance } from "./models/registry/adapter.registry.js";

/**
 * Central adapter resolver — lets each feature request only the adapter it needs:
 * @example
 * const cartAdapter = getAdapter("cart");
 * const productAdapter = getAdapter("product");
 *
 * @param {"order"|"cart"|"product"|"productDetail"|"auth"|"address"|"category"|"checkout"|"payment"|"wishlist"} name
 * @returns {any}
 */
export function getAdapter(name) {
  return getAdapterInstance(name);
}

/**
 * Convenience proxy to dynamically request adapters:
 * @example
 * await adapters.cart.addToCart(...)
 * await adapters.product.getProductList(...)
 */
export const adapters = new Proxy(
  {},
  {
    get(_, name) {
      return getAdapter(name);
    },
  }
);

export default getAdapter;
