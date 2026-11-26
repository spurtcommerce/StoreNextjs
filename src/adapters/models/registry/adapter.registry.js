// Adapter registry module - dynamic loading without static hardcoded adapter imports
import { getCommerceAdapter } from "../../../config/adapter.config.js";
import { getClientAuthToken } from "../../../utilities/tokenHelper.js";
import { adapterLoaders, defaultCapabilities, defaultAdapter } from "./adapter.loaders.js";

const registry = new Map();
const failedBrowserLoaders = new Set();

async function invokeServerAdapterRpc(domain, method, args) {
  if (
    typeof window === "undefined" ||
    window.__COMMERCE_CONFIG__?.adapterAvailable === false
  ) {
    return undefined;
  }

  try {
    const headers = { "Content-Type": "application/json" };
    const token = getClientAuthToken();
    if (token) {
      headers["x-storefront-token"] = token;
    }

    const res = await fetch("/api/customer/rpc", {
      method: "POST",
      credentials: "same-origin",
      headers,
      body: JSON.stringify({ domain, method, args }),
    });
    const data = await res.json().catch(() => null);
    if (res.ok && data?.ok) {
      return data.result;
    }
    return undefined;
  } catch {
    return undefined;
  }
}

/**
 * Register a commerce provider adapter package dynamically.
 * Allows any future adapter to connect.
 *
 * @param {string} providerName - Commerce provider identifier
 * @param {object} definition - { cart, product, productDetail, category, auth, address, checkout, payment, order, wishlist, store, capabilities }
 */
export function registerCommerceAdapter(providerName, definition) {
  if (!providerName || typeof providerName !== "string") return;
  const key = providerName.toLowerCase().trim();
  registry.set(key, {
    ...(registry.get(key) || {}),
    ...definition,
  });
}

/**
 * Extract an adapter definition from an imported module
 */
function extractAdapterDefinition(mod, providerName) {
  if (!mod) return null;
  const name = typeof providerName === "string" ? providerName.toLowerCase() : "";
  return (
    mod.definition ||
    mod.default ||
    (name ? mod[`${name}AdapterDefinition`] || mod[`${name}Adapter`] : null) ||
    mod
  );
}

/**
 * Ensures an adapter is registered in the registry.
 * Returns the definition if already loaded; otherwise returns null.
 *
 * @param {string} [providerName]
 * @returns {object|null}
 */
export function ensureAdapterLoaded(providerName) {
  const key = (providerName || getCommerceAdapter() || defaultAdapter || "").toLowerCase().trim();
  if (!key) return null;
  return registry.get(key) || null;
}

/**
 * Preload a specific adapter dynamically.
 * Only imports the adapter when available, caching it in the registry.
 *
 * @param {string} [adapterName]
 * @returns {Promise<object|null>}
 */
export async function preloadAdapter(adapterName) {
  const key = (adapterName || getCommerceAdapter() || defaultAdapter || "").toLowerCase().trim();
  if (!key) return null;
  if (registry.has(key)) return registry.get(key);

  // Server runtime: verify adapter folder is physically present and run from that folder
  if (typeof window === "undefined") {
    try {
      const { isAdapterAvailable, isDistModeRuntime } = await import(
        "../../../lib/adapterLocator.js"
      );
      if (!isAdapterAvailable(key)) {
        return null;
      }

      const { loadAdapter } = await import("../../../lib/loader/adapterLoader.js");
      const externalDef = loadAdapter(key);
      if (externalDef) {
        registerCommerceAdapter(key, externalDef);
        return registry.get(key);
      }

      // In standalone dist mode, adapters must run strictly from dist/adapters/<key>
      if (isDistModeRuntime()) {
        return null;
      }
    } catch {
      return null;
    }
  } else {
    // Browser runtime: refuse to load if server marked the adapter unavailable on disk
    if (
      typeof window.__COMMERCE_CONFIG__ === "object" &&
      window.__COMMERCE_CONFIG__ !== null &&
      window.__COMMERCE_CONFIG__.adapterAvailable === false
    ) {
      return null;
    }
  }

  const loader = adapterLoaders?.[key];
  if (loader && !(typeof window !== "undefined" && failedBrowserLoaders.has(key))) {
    try {
      const loadFn = typeof loader === "function" ? loader : loader?.load;
      if (typeof loadFn === "function") {
        const mod = await loadFn();
        const def = extractAdapterDefinition(mod, key);
        if (def) {
          registerCommerceAdapter(key, def);
          return registry.get(key);
        }
      }
    } catch (err) {
      if (typeof window !== "undefined") {
        failedBrowserLoaders.add(key);
      } else {
        console.warn(
          `[Adapter Registry] Dynamic import for adapter "${key}" failed:`,
          err.message || err
        );
      }
    }
  }

  return null;
}

/**
 * Preload the currently active adapter dynamically.
 */
export async function preloadActiveAdapter() {
  const provider = (getCommerceAdapter() || defaultAdapter || "").toLowerCase().trim();
  return provider ? preloadAdapter(provider) : null;
}

/**
 * Dynamically resolves an adapter instance for the specified domain
 * based on the active commerce adapter configured in store-config.json.
 *
 * - If the adapter is already loaded, constructs the class contract via `new Target()`.
 * - If not yet loaded, returns an async Proxy that dynamically imports the adapter
 *   before executing any method, ensuring absent adapters fail cleanly.
 *
 * @param {"cart"|"product"|"productDetail"|"category"|"auth"|"address"|"checkout"|"payment"|"order"|"wishlist"|"store"} domain
 * @returns {any}
 */
export function getAdapterInstance(domain) {
  const provider = (getCommerceAdapter() || defaultAdapter || "").toLowerCase().trim();
  if (!provider) {
    return null;
  }

  const providerDef = registry.get(provider);

  if (providerDef) {
    const Target = providerDef[domain];
    if (Target) {
      if (typeof Target === "function") {
        return new Target();
      }
      return Target;
    }
    return null;
  }

  // Async Proxy: dynamically imports the adapter on demand before executing any method
  return new Proxy(
    {},
    {
      get(_, prop) {
        return async (...args) => {
          let def = registry.get(provider);
          if (!def) {
            def = await preloadAdapter(provider);
          }
          if (!def) {
            if (typeof window !== "undefined") {
              return invokeServerAdapterRpc(domain, prop, args);
            }
            return undefined;
          }
          const Target = def[domain];
          if (!Target) {
            return undefined;
          }
          const instance = typeof Target === "function" ? new Target() : Target;
          if (typeof instance[prop] !== "function") {
            return instance[prop];
          }
          return instance[prop].apply(instance, args);
        };
      },
    }
  );
}

/**
 * Checks if the currently active adapter supports a specific feature
 * @param {string} capability - e.g. "reviews", "relatedProducts", "collections"
 * @returns {boolean}
 */
export function hasCapability(capability) {
  const provider = (getCommerceAdapter() || defaultAdapter || "").toLowerCase().trim();
  if (!provider) return false;

  if (
    typeof window !== "undefined" &&
    typeof window.__COMMERCE_CONFIG__ === "object" &&
    window.__COMMERCE_CONFIG__ !== null
  ) {
    if (window.__COMMERCE_CONFIG__.adapterAvailable === false) {
      return false;
    }
    const browserCaps = window.__COMMERCE_CONFIG__.adapterCapabilities;
    if (browserCaps && typeof browserCaps[capability] !== "undefined") {
      return Boolean(browserCaps[capability]);
    }
  }

  const providerDef = registry.get(provider);
  if (
    providerDef &&
    providerDef.capabilities &&
    typeof providerDef.capabilities[capability] !== "undefined"
  ) {
    return Boolean(providerDef.capabilities[capability]);
  }

  if (defaultCapabilities && defaultCapabilities[provider]) {
    return Boolean(defaultCapabilities[provider][capability]);
  }

  return false;
}

/**
 * Get all registered adapter names
 * @returns {string[]}
 */
export function getRegisteredAdapters() {
  const loaderKeys = adapterLoaders ? Object.keys(adapterLoaders) : [];
  return Array.from(new Set([...registry.keys(), ...loaderKeys]));
}
