import { getCommerceAdapter } from "../../../config/adapter.config.js";
import spurtDefinition from "../../spurt/index.js";
import medusaDefinition from "../../medusa/index.js";

const registry = new Map();

// Built-in registration for standard adapters (enables client-side browser execution)
registerCommerceAdapter("spurt", spurtDefinition);
registerCommerceAdapter("medusa", medusaDefinition);

const KNOWN_DEFAULT_CAPABILITIES = {
  medusa: {
    reviews: false,
    relatedProducts: false,
    variants: true,
    downloads: false,
    wishlist: true,
    specifications: false,
    banners: true,
  },
  spurt: {
    reviews: true,
    relatedProducts: true,
    variants: true,
    downloads: true,
    specifications: true,
    banners: true,
  },
};

/**
 * Register a commerce provider adapter package dynamically.
 * Allows any adapter (Spurt, Medusa, Shopify, BigCommerce, etc.) to connect.
 *
 * @param {string} providerName - e.g. "spurt", "medusa", "shopify"
 * @param {object} definition - { cart, product, productDetail, category, auth, address, checkout, payment, order, wishlist, capabilities }
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
 * Ensures the specified provider adapter is loaded into the registry.
 * Dynamically resolves external adapter packages from disk.
 *
 * @param {string} providerName
 * @returns {object|null}
 */
export function ensureAdapterLoaded(providerName) {
  if (!providerName) return null;
  const key = providerName.toLowerCase().trim();
  if (registry.has(key)) {
    return registry.get(key);
  }

  // Only attempt disk loading in Node.js runtime (server-side)
  if (typeof window === "undefined") {
    try {
      let loadAdapter = null;

      // 1. Next.js server bundle relative require
      try {
        const mod = require("../../../lib/loader/adapterLoader.js");
        loadAdapter = mod?.loadAdapter || mod?.default?.loadAdapter;
      } catch {}

      // 2. Direct absolute path resolution via Node module require
      if (!loadAdapter) {
        try {
          const req = typeof require !== "undefined" ? require : (0, eval)("require");
          const candidatePaths = [
            (process.cwd() + "/src/lib/loader/adapterLoader.js").replace(/\\/g, "/"),
            (process.cwd() + "/lib/loader/adapterLoader.js").replace(/\\/g, "/"),
          ];
          for (const p of candidatePaths) {
            try {
              const mod = req(p);
              loadAdapter = mod?.loadAdapter || mod?.default?.loadAdapter;
              if (loadAdapter) break;
            } catch {}
          }
        } catch {}
      }

      // 3. Fallback via createRequire
      if (!loadAdapter && typeof process !== "undefined") {
        try {
          const { createRequire } = (0, eval)("require")("module");
          const req = createRequire(process.cwd() + "/package.json");
          const mod = req((process.cwd() + "/src/lib/loader/adapterLoader.js").replace(/\\/g, "/"));
          loadAdapter = mod?.loadAdapter || mod?.default?.loadAdapter;
        } catch {}
      }

      if (loadAdapter) {
        const definition = loadAdapter(key);
        if (definition) {
          registerCommerceAdapter(key, definition);
          return registry.get(key);
        }
      }
    } catch (err) {
      console.warn(`[adapter.registry] Error loading adapter "${key}":`, err.message);
    }
  }

  return registry.get(key) || null;
}

/**
 * Dynamically resolves an adapter instance for the specified domain
 * based on the active commerce adapter configured in store-config.json.
 *
 * @param {"cart"|"product"|"productDetail"|"category"|"auth"|"address"|"checkout"|"payment"|"order"|"wishlist"|"store"} domain
 * @returns {any}
 */
export function getAdapterInstance(domain) {
  const rawProvider = getCommerceAdapter();
  const provider = rawProvider ? rawProvider.toLowerCase().trim() : "";

  if (!provider) {
    throw new Error(
      "No commerce adapter is configured. Please specify 'commerce.adapter' in store-config.json or NEXT_PUBLIC_COMMERCE_ADAPTER."
    );
  }

  let providerDef = registry.get(provider);

  if (!providerDef) {
    providerDef = ensureAdapterLoaded(provider);
  }

  if (!providerDef) {
    throw new Error(
      `Commerce adapter "${provider}" is not registered. Please ensure adapter build exists in dist/adapters/${provider} or adapters/${provider}. Available adapters: ${Array.from(registry.keys()).join(", ")}`
    );
  }

  const Target = providerDef[domain];
  if (!Target) {
    throw new Error(
      `Commerce provider "${provider}" does not implement "${domain}" adapter.`
    );
  }

  if (typeof Target === "function") {
    try {
      return new Target();
    } catch {
      return Target();
    }
  }

  return Target;
}

/**
 * Checks if the currently active adapter supports a specific feature
 * @param {string} capability - e.g. "reviews", "relatedProducts"
 * @returns {boolean}
 */
export function hasCapability(capability) {
  const rawProvider = getCommerceAdapter();
  const provider = rawProvider ? rawProvider.toLowerCase().trim() : "";
  if (!provider) return false;

  let providerDef = registry.get(provider);

  if (!providerDef) {
    providerDef = ensureAdapterLoaded(provider);
  }

  if (
    providerDef &&
    providerDef.capabilities &&
    typeof providerDef.capabilities[capability] !== "undefined"
  ) {
    return Boolean(providerDef.capabilities[capability]);
  }

  // Fallback to known default capabilities (safe on client-side where disk loading is skipped)
  if (
    KNOWN_DEFAULT_CAPABILITIES[provider] &&
    typeof KNOWN_DEFAULT_CAPABILITIES[provider][capability] !== "undefined"
  ) {
    return Boolean(KNOWN_DEFAULT_CAPABILITIES[provider][capability]);
  }

  return false;
}

/**
 * Get all registered adapter names
 * @returns {string[]}
 */
export function getRegisteredAdapters() {
  return Array.from(registry.keys());
}
