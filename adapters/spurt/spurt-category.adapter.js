import axiosInstance from "./spurt-client.js";
import { categoryEndpoints } from "../../api/apiEndpoints.js";
import { createCommonCategoryListResponse } from "../models/schemas/category-list.interface.js";
import { getAppId, getIndustrySlug, getSpurtEndpoint } from "../../utilities/url.js";

const CATEGORY_CACHE_TTL = 5 * 60 * 1000;
let cachedCategories = null;
let cachedCategoriesKey = "";
let cachedCategoriesTime = 0;
let inFlightCategoriesPromise = null;
let inFlightCategoriesKey = "";

function getCategoryCacheContextKey() {
  const base = getSpurtEndpoint() || "";
  const appId = getAppId() || "";
  const industry = getIndustrySlug() || "";
  let lang = "";
  if (typeof document !== "undefined") {
    try {
      const match = document.cookie.match(/(?:^|;\s*)languageKeyvalue=([^;]+)/);
      if (match && match[1]) {
        lang = decodeURIComponent(match[1]);
      }
    } catch {}
  }
  return `${base}|${appId}|${industry}|${lang}`;
}

function normalizeCategoryNode(cat) {
  if (!cat || typeof cat !== "object") return cat;
  return {
    ...cat,
    name: cat.name || cat.categoryName || "",
    categoryName: cat.categoryName || cat.name || "",
    categorySlug: cat.categorySlug || cat.slug || "",
    slug: cat.slug || cat.categorySlug || "",
    children: Array.isArray(cat.children)
      ? cat.children.map(normalizeCategoryNode)
      : [],
  };
}

function extractCategoryArray(payload) {
  if (Array.isArray(payload?.data)) return payload.data;
  if (Array.isArray(payload?.data?.categoryList)) return payload.data.categoryList;
  if (Array.isArray(payload?.data?.list)) return payload.data.list;
  return null;
}

export class SpurtCategoryAdapter {
  /**
   * Fetches category list from Spurt B2C API with retry and caching
   * @param {Object} [options]
   * @param {boolean} [options.forceRefresh=false]
   * @returns {Promise<Object>}
   */
  async getCategoryList(options = {}) {
    const forceRefresh = Boolean(options?.forceRefresh);
    const cacheKey = getCategoryCacheContextKey();

    if (
      !forceRefresh &&
      cachedCategories &&
      cachedCategoriesKey === cacheKey &&
      Date.now() - cachedCategoriesTime < CATEGORY_CACHE_TTL &&
      Array.isArray(cachedCategories.data) &&
      cachedCategories.data.length > 0
    ) {
      return cachedCategories;
    }

    if (!forceRefresh && inFlightCategoriesPromise && inFlightCategoriesKey === cacheKey) {
      return inFlightCategoriesPromise;
    }

    const endpoint = categoryEndpoints?.getCategoryList || "store-list/category";

    const fetchPromise = (async () => {
      let attempts = 0;
      const maxAttempts = 2;

      while (attempts < maxAttempts) {
        attempts++;
        try {
          const { data } = await axiosInstance.get(endpoint);
          const rawCategories = extractCategoryArray(data);

          if (data && data.status == 1 && Array.isArray(rawCategories) && rawCategories.length > 0) {
            const normalizedData = rawCategories.map(normalizeCategoryNode);
            const response = {
              ...data,
              data: normalizedData,
            };
            cachedCategories = response;
            cachedCategoriesKey = cacheKey;
            cachedCategoriesTime = Date.now();
            if (typeof window !== "undefined") {
              try {
                localStorage.setItem("cached_spurt_categories", JSON.stringify(normalizedData));
              } catch (_) {}
            }
            return response;
          }

          if (data && data.status == 1) {
            return {
              ...data,
              data: Array.isArray(rawCategories) ? rawCategories : [],
            };
          }
        } catch (error) {
          if (attempts < maxAttempts) {
            await new Promise((r) => setTimeout(r, 300));
            continue;
          }
          console.warn("SpurtCategoryAdapter getCategoryList warning:", error?.message || error);
        }
      }

      // Fallback to cached categories if available in browser
      if (typeof window !== "undefined") {
        try {
          const stored = localStorage.getItem("cached_spurt_categories");
          if (stored) {
            const parsed = JSON.parse(stored);
            if (Array.isArray(parsed) && parsed.length > 0) {
              return createCommonCategoryListResponse({
                status: 1,
                message: "Loaded from cache",
                data: parsed,
              });
            }
          }
        } catch (_) {}
      }

      return createCommonCategoryListResponse({
        status: 0,
        message: "Failed to fetch categories from Spurt API",
        data: [],
      });
    })();

    inFlightCategoriesPromise = fetchPromise;
    inFlightCategoriesKey = cacheKey;

    try {
      return await fetchPromise;
    } finally {
      if (inFlightCategoriesPromise === fetchPromise) {
        inFlightCategoriesPromise = null;
        inFlightCategoriesKey = "";
      }
    }
  }

  async getSellerData(offset) {
    try {
      const data = await axiosInstance.get(
        `vendor-store/category-based-vendor-list?&categorySlug=&limit=10&offset=${offset}`
      );
      return data?.data || null;
    } catch {
      return null;
    }
  }

  async getSellerCount() {
    try {
      const data = await axiosInstance.get(
        `vendor-store/category-based-vendor-list?&categorySlug=&count=1`
      );
      return data?.data || null;
    } catch {
      return null;
    }
  }

  async getSubCategory(slug) {
    try {
      const data = await axiosInstance.get(
        `store-list/category?categorySlug=${encodeURIComponent(slug || "")}`
      );
      return data?.data || null;
    } catch {
      return null;
    }
  }

  async getFooterPages() {
    try {
      const { data } = await axiosInstance.get(`/pages`);
      return data?.status == 1 ? data : [];
    } catch {
      return [];
    }
  }

  async getCurrencyPrices() {
    try {
      const axios = (await import("axios")).default;
      const data = await axios.get(`https://open.er-api.com/v6/latest/INR`);
      return data?.data || null;
    } catch {
      return null;
    }
  }
}
