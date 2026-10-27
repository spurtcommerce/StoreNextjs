/**
 * Dynamic Common Schema Gateway
 *
 * Dynamically resolves and proxies schemas, DTOs, and interface mappers
 * from the currently connected commerce adapter (e.g. Medusa or Spurt).
 * Unconnected adapters are never loaded, avoiding unnecessary schema overhead.
 */
import { getCommerceAdapter } from "../../../config/adapter.config.js";
import { ensureAdapterLoaded } from "../registry/adapter.registry.js";

/**
 * Returns the schemas exported by the currently connected adapter.
 *
 * @returns {Record<string, any>} Active adapter schemas
 */
export function getActiveSchemas() {
  const rawProvider = getCommerceAdapter();
  const provider = rawProvider ? rawProvider.toLowerCase().trim() : "";
  if (!provider) return {};
  const providerDef = ensureAdapterLoaded(provider);
  return providerDef?.schemas || {};
}

/**
 * Common dynamic schema proxy - delegates to the active connector adapter
 */
export const schemas = new Proxy(
  {},
  {
    get(_, prop) {
      const active = getActiveSchemas();
      if (prop in active) {
        return active[prop];
      }
      return undefined;
    },
  }
);

// Dynamic DTO helpers that safely delegate to the active connector adapter
export const createCommonProductRow = (partial = {}) => {
  const active = getActiveSchemas();
  if (typeof active.createCommonProductRow === "function") {
    return active.createCommonProductRow(partial);
  }
  return partial;
};

export const createCommonProductListResponse = (data = [], extra = {}) => {
  const active = getActiveSchemas();
  if (typeof active.createCommonProductListResponse === "function") {
    return active.createCommonProductListResponse(data, extra);
  }
  return { status: 1, message: "Success", data: Array.isArray(data) ? data : [] };
};

export const createCommonProductDetailResponse = (data = {}, extra = {}) => {
  const active = getActiveSchemas();
  if (typeof active.createCommonProductDetailResponse === "function") {
    return active.createCommonProductDetailResponse(data, extra);
  }
  return { status: 1, message: "Success", data: data || {} };
};

export const createCommonCartLineItem = (partial = {}) => {
  const active = getActiveSchemas();
  if (typeof active.createCommonCartLineItem === "function") {
    return active.createCommonCartLineItem(partial);
  }
  return partial;
};

export const createCommonAddToCartResponse = (options = {}) => {
  const active = getActiveSchemas();
  if (typeof active.createCommonAddToCartResponse === "function") {
    return active.createCommonAddToCartResponse(options);
  }
  return { status: 1, message: "Added to cart", data: options?.data || null };
};

export default schemas;
