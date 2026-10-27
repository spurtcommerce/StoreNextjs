import { getAdapterInstance } from "./adapter.registry.js";

/**
 * Returns the configured ProductListAdapter instance dynamically
 * @returns {any}
 */
export function getProductListAdapter() {
  return getAdapterInstance("product");
}

/**
 * Returns the configured ProductDetailAdapter instance dynamically
 * @returns {any}
 */
export function getProductDetailAdapter() {
  return getAdapterInstance("productDetail");
}

export default getProductListAdapter;
