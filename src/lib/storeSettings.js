import { getStoreSettings } from "@/api/commonApi";
import { getStoreSettingsFromConfig } from "@/adapters/models/registry/store-adapter.helper";

/**
 * Server-authoritative store settings reader.
 * Settings affecting pricing, taxes, currency, or store behavior are read
 * on the server from the store adapter, backend API, or server-side configuration,
 * never trusted from client-editable cookies.
 *
 * @returns {Promise<Array<object>>}
 */
export async function storeSettingsData() {
  try {
    const settings = await getStoreSettings();
    if (Array.isArray(settings) && settings.length > 0) {
      return settings;
    }
    const fallback = getStoreSettingsFromConfig();
    return Array.isArray(fallback) ? fallback : fallback ? [fallback] : [];
  } catch (error) {
    console.error("[storeSettings] Error reading server-authoritative store settings:", error);
    const fallback = getStoreSettingsFromConfig();
    return Array.isArray(fallback) ? fallback : fallback ? [fallback] : [];
  }
}
