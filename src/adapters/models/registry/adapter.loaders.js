/**
 * Dynamic adapter loader mappings (auto-synced with folders physically present in src/adapters).
 * Adapters are imported on-demand only when present on disk and configured.
 */
export const adapterLoaders = {
  "medusa": () => import("../../medusa/index.js"),
  "opencart": () => import("../../opencart/index.js"),
  "spurt": () => import("../../spurt/index.js"),
  "woocommerce": () => import("../../woocommerce/index.js"),
};

/**
 * Fallback capabilities read from each present adapter's adapter.json.
 */
export const defaultCapabilities = {
  "medusa": {"reviews":false,"relatedProducts":false,"variants":true,"downloads":false,"wishlist":true,"specifications":false,"banners":false,"collections":true,"featuredProducts":false},
  "opencart": {"reviews":true,"relatedProducts":true,"variants":true,"downloads":true,"wishlist":true,"specifications":true,"banners":true,"backorders":true,"multilingual":true,"compare":true,"pages":true,"filters":true},
  "spurt": {"reviews":true,"relatedProducts":true,"variants":true,"downloads":true,"specifications":true,"banners":true,"featuredProducts":true,"collections":false},
  "woocommerce": {"reviews":true,"relatedProducts":true,"variants":true,"downloads":false,"wishlist":true,"specifications":true,"banners":true,"compare":false},
};

/**
 * Default fallback commerce adapter identifier when none is specified.
 * Do not set a fallback adapter so absent adapters cleanly prompt connection.
 */
export const defaultAdapter = "";

export default adapterLoaders;
