import { getAdapterInstance } from "./adapter.registry.js";

/**
 * Returns the configured WishlistAdapter instance dynamically
 * @returns {any}
 */
export function getWishlistAdapter() {
  return getAdapterInstance("wishlist");
}

export default getWishlistAdapter;
