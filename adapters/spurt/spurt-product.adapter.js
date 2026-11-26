import axiosInstance from "./spurt-client.js";
import { productsEndpoints } from "../../api/apiEndpoints.js";


import {
  createCommonProductListResponse,
  createCommonProductDetailResponse,
} from "../models/schemas/product-list.interface.js";


function isAdvancedSkuSearchEnabled(params) {
  if (params && typeof params === "object") {
    const s = params.storeSettings || params.settings;
    const entry = Array.isArray(s) ? s[0] : s;
    if (entry && entry.enableAdvancedSkuSearch !== undefined) {
      const val = entry.enableAdvancedSkuSearch;
      return val === true || val === 1 || val === "1" || val === "true";
    }
    if (params.enableAdvancedSkuSearch !== undefined) {
      const val = params.enableAdvancedSkuSearch;
      return val === true || val === 1 || val === "1" || val === "true";
    }
  }
  if (typeof window !== "undefined") {
    try {
      const stored =
        localStorage.getItem("storeSetting") ||
        localStorage.getItem("storeSettings");
      if (stored) {
        const parsed = JSON.parse(stored);
        const entry = Array.isArray(parsed) ? parsed[0] : parsed;
        if (entry && entry.enableAdvancedSkuSearch !== undefined) {
          const val = entry.enableAdvancedSkuSearch;
          return val === true || val === 1 || val === "1" || val === "true";
        }
      }
    } catch (e) {}
  }
  return true;
}

export function enrichKeywordSuggestions(matchedKeywords, productList, params) {
  const products = Array.isArray(productList) ? productList : [];
  const rawKeywords = Array.isArray(matchedKeywords) ? matchedKeywords : [];

  // When advanced SKU search is enabled:
  // 1. Keyword suggestions show only keyword text, NOT product image and NOT category
  // 2. If matchedKeywords is empty, keep it empty so product resultants can be displayed instead
  if (isAdvancedSkuSearchEnabled(params)) {
    if (rawKeywords.length === 0) {
      return [];
    }
    const cleanKws = [];
    const seen = new Set();
    for (const kw of rawKeywords) {
      const kwText = typeof kw === "string" ? kw : (kw?.keyword || kw?.name || "");
      if (!kwText) continue;
      const key = kwText.toLowerCase().trim();
      if (seen.has(key)) continue;
      seen.add(key);
      cleanKws.push({
        keyword: kwText.trim(),
        name: kwText.trim(),
        isKeywordSuggestion: true,
        toString() {
          return this.keyword;
        },
      });
    }
    return cleanKws;
  }

  const extractProductFields = (p) => {
    if (!p || typeof p !== "object") return {};
    const imgObj = Array.isArray(p.productImage) ? p.productImage[0] : p.productImage;
    const catObj = p.categoryName || p.category;
    return {
      image: imgObj?.image || p.image || p.thumbnail || "",
      containerName: imgObj?.containerName || p.containerName || "",
      categoryName: typeof catObj === "string" ? catObj : (catObj?.name || catObj?.categoryName || ""),
      categorySlug: catObj?.categorySlug || catObj?.slug || "",
      productSlug: p.productSlug || p.slug || "",
      productId: p.productId || p.id || null,
      sku: p.sku || "",
    };
  };

  const results = [];
  const seen = new Set();

  const addKeywordItem = (kwText, productContext) => {
    const text = String(kwText || "").trim();
    if (!text) return;
    const key = text.toLowerCase();
    if (seen.has(key)) return;
    seen.add(key);

    const ctx = extractProductFields(productContext);
    const item = {
      keyword: text,
      name: text,
      ...ctx,
      toString() {
        return this.keyword;
      },
    };
    results.push(item);
  };

  // 1. First, process matchedKeywords from backend API
  for (const kw of rawKeywords) {
    const kwText = typeof kw === "string" ? kw : (kw?.keyword || kw?.name || "");
    if (!kwText) continue;
    const lowerKw = kwText.toLowerCase();

    // Find best matching product from productList for this keyword
    let matchedProd = products.find((p) => {
      const pName = String(p?.name || "").toLowerCase();
      const pSku = String(p?.sku || "").toLowerCase();
      const pCat = String(p?.categoryName?.name || p?.categoryName?.categoryName || "").toLowerCase();
      return (
        pName.includes(lowerKw) ||
        lowerKw.includes(pName) ||
        pSku.includes(lowerKw) ||
        pCat.includes(lowerKw)
      );
    });

    if (!matchedProd && products.length > 0) {
      matchedProd = products[0];
    }

    addKeywordItem(kwText, matchedProd);
  }

  // 2. Also add matching products from productList as suggestions
  for (const prod of products) {
    if (prod?.name) {
      addKeywordItem(prod.name, prod);
    }
  }

  return results;
}

export class SpurtProductAdapter {
  /**
   * Fetches product list from Spurt B2C API
   * @param {import('./product-list.interface').ProductListParams|string} params
   * @returns {Promise<import('./product-list.interface').CommonProductListResponse>}
   */
  async getProductList(params) {
    try {
      let queryString = "";
      if (typeof params === "string") {
        queryString = params;
      } else if (params && typeof params === "object") {
        const query = new URLSearchParams();
        Object.entries(params).forEach(([key, val]) => {
          if (val !== undefined && val !== null && val !== "") {
            query.append(key, String(val));
          }
        });
        queryString = query.toString();
      }

      const endpoint = `${productsEndpoints.getAllProductsList}${queryString ? `?${queryString}` : ""}`;
      const { data } = await axiosInstance.get(endpoint);

      if (data && data.status == 1) {
        const parsed = typeof params === "string" ? Object.fromEntries(new URLSearchParams(params)) : (params || {});
        const isCount = parsed?.count == 1 || parsed?.count === "1" || parsed?.count === true;
        const isEmpty = isCount
          ? (data?.data === 0 || data?.data === "0" || !data?.data)
          : (!data?.data || (Array.isArray(data.data) && data.data.length === 0));

        const searchKeyword = (parsed?.keyword || parsed?.search || parsed?.sku || parsed?.skuName || "").trim();

        if (searchKeyword && isEmpty && !parsed?._isSearchFallback) {
          const searchRes = await this.searchProducts({ ...parsed, _isSearchFallback: true });
          if (searchRes?.status == 1 && Array.isArray(searchRes?.data) && searchRes.data.length > 0) {
            if (isCount) {
              return {
                status: 1,
                message: "Successfully got the count of products",
                data: searchRes.data.length,
                count: searchRes.data.length,
              };
            }
            return searchRes;
          }
        }

        return data;
      }

      return createCommonProductListResponse({
        status: 0,
        message: data?.message || "Failed to fetch products from Spurt API",
        data: [],
      });
    } catch (error) {
      console.warn("SpurtProductAdapter getProductList warning:", error?.message || error);
      return createCommonProductListResponse({
        status: 0,
        message: error?.message || "Error connecting to Spurt API",
        data: [],
      });
    }
  }

  /**
   * Fetches product detail from Spurt B2C API
   * @param {string} slug
   * @returns {Promise<import('./product-list.interface').CommonProductDetailResponse>}
   */
  async getProductDetail(slug) {
    try {
      if (!slug) {
        return createCommonProductDetailResponse({
          status: 0,
          message: "Product slug or ID is required",
          data: null,
        });
      }

      // Fully decode any multiple percent-encodings first to avoid %257C issues
      let cleanSlug = String(slug).trim();
      try {
        while (cleanSlug.includes("%") && decodeURIComponent(cleanSlug) !== cleanSlug) {
          cleanSlug = decodeURIComponent(cleanSlug);
        }
      } catch (e) {}
      cleanSlug = cleanSlug.replace(/^\/+|\/+$/g, "");

      const encodedSlug = encodeURIComponent(cleanSlug);
      let endpoint = `product-store/productdetail/${encodedSlug}`;
      let res;
      try {
        res = await axiosInstance.get(endpoint);
      } catch (err) {
        // If encoded request failed and cleanSlug contains raw special chars, try direct
        if (encodedSlug !== cleanSlug) {
          try {
            res = await axiosInstance.get(`product-store/productdetail/${cleanSlug}`);
          } catch {
            throw err;
          }
        } else {
          throw err;
        }
      }

      let data = res?.data;

      // If status is not 1 and cleanSlug is purely numeric ID, fallback to looking up productSlug
      if ((!data || data.status != 1) && !isNaN(Number(cleanSlug))) {
        try {
          const listRes = await axiosInstance.get(`store-list/custom-product-list?productId=${cleanSlug}`);
          const foundSlug = listRes?.data?.data?.[0]?.productSlug;
          if (foundSlug && foundSlug !== cleanSlug) {
            const detailRes = await axiosInstance.get(`product-store/productdetail/${encodeURIComponent(foundSlug)}`);
            if (detailRes?.data?.status == 1) {
              data = detailRes.data;
            }
          }
        } catch (e) {}
      }

      if (data && data.status == 1) {
        return data;
      }

      return createCommonProductDetailResponse({
        status: 0,
        message: data?.message || "Failed to fetch product detail from Spurt API",
        data: null,
      });
    } catch (error) {
      const isExpectedNotFound =
        error?.response?.status === 400 ||
        error?.response?.status === 404;

      if (!isExpectedNotFound) {
        console.warn("SpurtProductAdapter getProductDetail warning:", error?.message || error);
      }
      return createCommonProductDetailResponse({
        status: 0,
        message: error?.response?.data?.message || error?.message || "Invalid product",
        data: null,
      });
    }
  }

  async searchProducts(params) {
    let keyword = "";
    let limit = 10;
    let offset = 0;
    const query = new URLSearchParams();

    if (typeof params === "string") {
      const parsed = Object.fromEntries(new URLSearchParams(params));
      keyword = parsed.keyword ?? parsed.search ?? "";
      limit = parsed.limit ? parseInt(parsed.limit, 10) : 10;
      offset = parsed.offset ? parseInt(parsed.offset, 10) : 0;
      new URLSearchParams(params).forEach((v, k) => query.set(k, v));
    } else if (params && typeof params === "object") {
      keyword = params.keyword ?? params.search ?? "";
      limit = params.limit ?? 10;
      offset = params.offset ?? 0;
      Object.entries(params).forEach(([k, v]) => {
        if (v !== undefined && v !== null && v !== "") {
          query.set(k, String(v));
        }
      });
    }

    const trimmedKeyword = String(keyword || query.get("keyword") || "").trim();
    const explicitSku = String(params?.skuName || params?.sku || query.get("skuName") || query.get("sku") || "").trim();

    // 1. If explicit SKU is provided, search by skuName directly on product-search-list
    if (explicitSku) {
      try {
        const skuEndpoint = `product-store/product-search-list?skuName=${encodeURIComponent(explicitSku)}&limit=${limit}&offset=${offset}`;
        const { data } = await axiosInstance.get(skuEndpoint);
        if (data?.status == 1 && Array.isArray(data?.data) && data.data.length > 0) {
          data.matchedKeywords = enrichKeywordSuggestions(data.matchedKeywords, data.data, params);
          return data;
        }
      } catch (e) {}
    }

    // 2. Standard search: call product-store/product-search-list?keyword=...
    if (trimmedKeyword) {
      try {
        const kwEndpoint = `product-store/product-search-list?keyword=${encodeURIComponent(trimmedKeyword)}&limit=${limit}&offset=${offset}`;
        const { data } = await axiosInstance.get(kwEndpoint);
        if (data?.status == 1 && Array.isArray(data?.data)) {
          if (data.data.length > 0) {
            data.matchedKeywords = enrichKeywordSuggestions(data.matchedKeywords, data.data, params);
            return data;
          }

          // Keyword returned 0 results: check if it's an SKU using skuName endpoint
          const skuEndpoint = `product-store/product-search-list?skuName=${encodeURIComponent(trimmedKeyword)}&limit=${limit}&offset=${offset}`;
          const { data: skuData } = await axiosInstance.get(skuEndpoint);
          if (skuData?.status == 1 && Array.isArray(skuData?.data) && skuData.data.length > 0) {
            skuData.matchedKeywords = enrichKeywordSuggestions(skuData.matchedKeywords, skuData.data, params);
            return skuData;
          }

          // Try SKU with spaces replaced by hyphens (e.g. "CUSHION SHOE 898" -> "CUSHION-SHOE-898")
          const hyphenSku = trimmedKeyword.replace(/\s+/g, "-");
          if (hyphenSku !== trimmedKeyword) {
            const normEndpoint = `product-store/product-search-list?skuName=${encodeURIComponent(hyphenSku)}&limit=${limit}&offset=${offset}`;
            const { data: normData } = await axiosInstance.get(normEndpoint);
            if (normData?.status == 1 && Array.isArray(normData?.data) && normData.data.length > 0) {
              normData.matchedKeywords = enrichKeywordSuggestions(normData.matchedKeywords, normData.data, params);
              return normData;
            }
          }
        }
      } catch (e) {
        // Advanced SKU search might be disabled on vendor side, or network error; proceed to fallback
      }

      // Fallback 1: Query custom-product-list?keyword=... directly
      try {
        const fallbackEndpoint = `${productsEndpoints.getAllProductsList}?keyword=${encodeURIComponent(trimmedKeyword)}&limit=${limit}&offset=${offset}`;
        const { data: fallbackData } = await axiosInstance.get(fallbackEndpoint);
        if (fallbackData?.status == 1 && Array.isArray(fallbackData?.data) && fallbackData.data.length > 0) {
          fallbackData.matchedKeywords = enrichKeywordSuggestions(fallbackData.matchedKeywords, fallbackData.data, params);
          return fallbackData;
        }
      } catch (e) {}

      // Fallback 2: Catalog in-memory scan (custom-product-list?limit=100&offset=0)
      try {
        const catEndpoint = `${productsEndpoints.getAllProductsList}?limit=100&offset=0`;
        const { data: catData } = await axiosInstance.get(catEndpoint);
        if (catData?.status == 1 && Array.isArray(catData?.data) && catData.data.length > 0) {
          const lowerTerm = trimmedKeyword.toLowerCase();
          const targetSku = (explicitSku || trimmedKeyword).toLowerCase();
          const matched = catData.data.filter((p) => {
            const pSku = String(p?.sku || "").toLowerCase();
            const pName = String(p?.name || "").toLowerCase();
            return (
              (pSku && (pSku === targetSku || pSku.includes(lowerTerm) || lowerTerm.includes(pSku))) ||
              (pName && pName.includes(lowerTerm))
            );
          });
          if (matched.length > 0) {
            const sliced = matched.slice(offset, offset + limit);
            return {
              status: 1,
              message: "Successfully found products by SKU match",
              data: sliced,
              matchedKeywords: enrichKeywordSuggestions([], matched),
              totalCount: matched.length,
              count: matched.length,
            };
          }
        }
      } catch (e) {}
    }

    return {
      status: 1,
      message: "Successfully got a product search list",
      matchedKeywords: [],
      data: [],
      totalCount: 0,
      count: 0,
    };
  }

  /**
   * Fetches product keyword search list from Spurt B2C API
   * Endpoint: product-store/product-search-list?keyword=${keyword}&limit=${limit}&offset=${offset}
   * @param {string|{keyword?: string, limit?: number, offset?: number}} params
   * @returns {Promise<{status: number, message: string, data: string[], matchedKeywords?: string[]}>}
   */
  async getKeywordSearch(params) {
    let keyword = "";
    let limit = 10;
    let offset = 0;

    if (typeof params === "string") {
      keyword = params;
    } else if (params && typeof params === "object") {
      keyword = params.keyword ?? params.search ?? "";
      limit = params.limit ?? 10;
      offset = params.offset ?? 0;
    }

    const trimmedKeyword = String(keyword).trim();
    if (!trimmedKeyword) {
      return { status: 1, message: "Empty keyword", data: [], matchedKeywords: [] };
    }

    try {
      const endpoint = `product-store/product-search-list?keyword=${encodeURIComponent(trimmedKeyword)}&limit=${limit}&offset=${offset}`;
      const { data } = await axiosInstance.get(endpoint);

      let products = Array.isArray(data?.data) ? data.data : [];
      let rawKeywords = Array.isArray(data?.matchedKeywords) ? data.matchedKeywords : [];

      // If keyword returned empty, check SKU search via skuName
      if (products.length === 0 && rawKeywords.length === 0) {
        try {
          const skuEndpoint = `product-store/product-search-list?skuName=${encodeURIComponent(trimmedKeyword)}&limit=${limit}&offset=${offset}`;
          const { data: skuData } = await axiosInstance.get(skuEndpoint);
          if (skuData && skuData.status == 1) {
            products = Array.isArray(skuData.data) ? skuData.data : [];
            rawKeywords = Array.isArray(skuData.matchedKeywords) ? skuData.matchedKeywords : [];
          }
        } catch (e) {}

        if (products.length === 0 && rawKeywords.length === 0 && trimmedKeyword.includes(" ")) {
          try {
            const normEndpoint = `product-store/product-search-list?skuName=${encodeURIComponent(trimmedKeyword.replace(/\s+/g, "-"))}&limit=${limit}&offset=${offset}`;
            const { data: normData } = await axiosInstance.get(normEndpoint);
            if (normData && normData.status == 1) {
              products = Array.isArray(normData.data) ? normData.data : [];
              rawKeywords = Array.isArray(normData.matchedKeywords) ? normData.matchedKeywords : [];
            }
          } catch (e) {}
        }
      }

      const enriched = enrichKeywordSuggestions(rawKeywords, products, params);
      if (enriched.length > 0) {
        return {
          status: 1,
          message: data?.message || "Successfully fetched product keyword search list",
          data: enriched,
          matchedKeywords: enriched,
        };
      } else if (isAdvancedSkuSearchEnabled(params)) {
        return {
          status: 1,
          message: "No matched keywords",
          data: [],
          matchedKeywords: [],
        };
      }
    } catch (e) {}

    // Fallback: catalog scan (only when advanced SKU search is disabled)
    if (!isAdvancedSkuSearchEnabled(params)) {
      try {
        const catEndpoint = `${productsEndpoints.getAllProductsList}?limit=100&offset=0`;
        const { data: catData } = await axiosInstance.get(catEndpoint);
        if (catData?.status == 1 && Array.isArray(catData?.data) && catData.data.length > 0) {
          const lowerTerm = trimmedKeyword.toLowerCase();
          const matched = catData.data.filter((p) => {
            const pSku = String(p?.sku || "").toLowerCase();
            const pName = String(p?.name || "").toLowerCase();
            return (pSku && (pSku === lowerTerm || pSku.includes(lowerTerm))) || (pName && pName.includes(lowerTerm));
          });
          if (matched.length > 0) {
            const enriched = enrichKeywordSuggestions([], matched, params);
            return {
              status: 1,
              message: "Successfully fetched keyword suggestions",
              data: enriched,
              matchedKeywords: enriched,
            };
          }
        }
      } catch (e) {}
    }

    return {
      status: 1,
      message: "No keywords found",
      data: [],
      matchedKeywords: [],
    };
  }

  async searchKeywords(params) {
    return this.getKeywordSearch(params);
  }

  async productKeywordSearch(params) {
    return this.getKeywordSearch(params);
  }

  async keywordSearch(params) {
    return this.getKeywordSearch(params);
  }

  async getProductMetaData(slug) {
    try {
      const { data } = await axiosInstance.get(`seo/product/${slug}`);
      return data?.status == 1 ? data?.data || {} : {};
    } catch (e) {
      return {};
    }
  }

  async getSellerDetail(name) {
    try {
      const result = await axiosInstance.get(`vendor-store/vendor-details/${name}`);
      return result?.data || null;
    } catch (e) {
      return null;
    }
  }

  async getSellerProducts(name) {
    try {
      const result = await axiosInstance.get(
        `vendor-store/vendor-product-list?limit=0&offset=0&count=0&categorySlug=&displayNameUrl=${name}`
      );
      return result?.data || [];
    } catch (e) {
      return [];
    }
  }

  async getMetaData(slug) {
    try {
      const data = await axiosInstance.get(`seo/product/${slug}`);
      return data?.data || {};
    } catch (e) {
      return {};
    }
  }

  async getFilter(categorySlug) {
    try {
      const data = await axiosInstance.get(`site-filter/${categorySlug}`);
      return data?.data || {};
    } catch (e) {
      return {};
    }
  }

  async getWidgetDetail(slug) {
    try {
      const result = await axiosInstance.get(`store-widget/detail/${slug}`);
      if (result?.data?.status === 1 && result?.data?.data) {
        return result.data.data;
      }
      const fallback = await axiosInstance.get(`list/widget-detail/${slug}?limit=1&offset=0`);
      return fallback?.data || [];
    } catch (e) {
      return [];
    }
  }

  async getMaxPrice() {
    try {
      const result = await axiosInstance.get(`store-list/product-count`);
      if (result && result.data?.status == 1) {
        return result.data.data?.maximumProductPrice || 100000;
      }
      return 100000;
    } catch {
      return 100000;
    }
  }

  async compareProducts(data, compareIds) {
    try {
      const dataParam = data !== undefined && data !== null ? data : 0;
      const idsParam = Array.isArray(compareIds) ? compareIds.join(",") : (compareIds ?? "");
      const result = await axiosInstance.get(
        `product-store/product-compare?data=${dataParam}&productId=${idsParam}`
      );
      return result?.data || null;
    } catch (e) {
      if (e?.response?.data) {
        return e.response.data;
      }
      return null;
    }
  }

  async getVariants(slug) {
    try {
      const { data } = await axiosInstance.get(
        `product-store/product-variants/${slug}`
      );
      return data?.status == 1 ? data : {};
    } catch {
      return {};
    }
  }

  async getWidgetList() {
    try {
      const { data } = await axiosInstance.get("store-widget/list");
      if (data?.status == 1 && Array.isArray(data?.data)) {
        return data.data;
      }
      const fallback = await axiosInstance.get("widget/widget-list");
      return fallback?.data?.status == 1 && Array.isArray(fallback?.data?.data)
        ? fallback.data.data
        : [];
    } catch {
      return [];
    }
  }

  async getWidgetProducts(params = {}) {
    try {
      const widgets = await this.getWidgetList();
      const allProducts = [];
      if (Array.isArray(widgets)) {
        widgets.forEach((widget) => {
          if (Array.isArray(widget.items)) {
            allProducts.push(...widget.items);
          }
        });
      }
      return {
        status: allProducts.length > 0 ? 1 : 0,
        message:
          allProducts.length > 0
            ? "Successfully got widget products"
            : "No widget products found",
        data: allProducts,
        products: allProducts,
      };
    } catch {
      return { status: 0, data: [], products: [] };
    }
  }

  /**
   * Fetches featured product list from Spurt B2C API
   * Endpoint: api/product-store/featured-product-list
   * @param {Object} [params]
   * @param {number} [params.limit]
   * @param {number} [params.offset]
   * @param {string} [params.keyword]
   * @param {number|boolean|string} [params.count]
   * @returns {Promise<Object>}
   */
  async getFeaturedProductList(params = {}) {
    try {
      const query = new URLSearchParams();
      if (typeof params === "string") {
        const clean = params.startsWith("?") ? params.slice(1) : params;
        const sp = new URLSearchParams(clean);
        sp.forEach((val, key) => {
          if (val !== undefined && val !== null && val !== "") {
            query.append(key, val);
          }
        });
      } else if (params && typeof params === "object") {
        Object.entries(params).forEach(([key, val]) => {
          if (val !== undefined && val !== null && val !== "") {
            query.append(key, String(val));
          }
        });
      }

      const qs = query.toString();
      const endpoint = `product-store/featured-product-list${qs ? `?${qs}` : ""}`;
      const { data } = await axiosInstance.get(endpoint);

      if (data && data.status == 1) {
        if (Array.isArray(data.data) && data.data.length > 0) {
          const productIds = data.data
            .map((p) => p.productId || p.id)
            .filter(Boolean)
            .join(",");

          if (productIds) {
            try {
              const enrichedRes = await this.getProductList({
                productIds,
                limit: data.data.length || 100,
              });
              if (
                enrichedRes?.status == 1 &&
                Array.isArray(enrichedRes?.data) &&
                enrichedRes.data.length > 0
              ) {
                const enrichedMap = new Map();
                enrichedRes.data.forEach((p) => {
                  const idKey = String(p.productId || p.id);
                  enrichedMap.set(idKey, p);
                });

                data.data = data.data.map((item) => {
                  const idKey = String(item.productId || item.id);
                  const full = enrichedMap.get(idKey);
                  if (full) {
                    return {
                      ...item,
                      ...full,
                      image: full.image || item.image,
                      containerName: full.containerName || item.containerName,
                      defaultImage: full.defaultImage || item.defaultImage,
                      taxType: full.taxType !== undefined ? full.taxType : item.taxType,
                      taxValue: full.taxValue !== undefined ? full.taxValue : item.taxValue,
                      price: full.price || item.price,
                      pricerefer: full.pricerefer || item.pricerefer || "",
                      flag: full.flag || item.flag || "",
                      skuId: full.skuId || item.skuId,
                      sku: full.sku || item.sku,
                      hasStock: full.hasStock !== undefined ? full.hasStock : item.hasStock,
                    };
                  }
                  return item;
                });
              }
            } catch (enrichError) {
              console.warn(
                "SpurtProductAdapter: Failed to enrich featured products with details:",
                enrichError?.message
              );
            }
          }
        }
        return data;
      }

      return {
        status: 0,
        message: data?.message || "Failed to fetch featured products from Spurt API",
        data: [],
      };
    } catch (error) {
      console.error("SpurtProductAdapter getFeaturedProductList error:", error);
      return {
        status: 0,
        message:
          error?.response?.data?.message ||
          error?.message ||
          "Error connecting to Spurt API",
        data: [],
      };
    }
  }
}

