import { getAllProductsList } from "@/api/ProductsApi";
import { getfilter } from "@/api/ProductDetailApi";
import { getCategoryList } from "@/api/TopCategoriesApi";
import axiosInstance from "@/api/interceptor";
import { isSpurtAdapter } from "@/config/adapter.config";
import { cleanText } from "@/utilities/helper";

export function onImgError(e) {
  e.target.src = "/img/no-image.png";
  e.target.onerror = null;
}

/**
 * Fetch and return the product list.
 * Normalization is performed within the commerce adapters.
 * @param {string} queryParams - Raw query string, e.g. "limit=20&offset=0&categorySlug=chairs"
 */
export async function getProducts(queryParams = "limit=20&offset=0") {
  try {
    const result = await getAllProductsList(queryParams);
    if (!result || result.status !== 1) {
      return [];
    }

    const fetched = Array.isArray(result?.data) ? result.data : [];

    return fetched.map((p) => ({
      slug: p.slug || p.productSlug || String(p.productId || p.skuId || ""),
      name: p.name || "",
      description: p.description || "",
      price: p.price ?? 0,
      originalPrice: p.originalPrice ?? 0,
      image: p.image || "",
      images: Array.isArray(p.images) && p.images.length > 0 ? p.images : (p.image ? [p.image] : []),
      containerName: p.containerName || "",
      colors: p.colors || [],
      materials: p.materials || [],
      category: p.category || "",
      categorySlug: p.categorySlug || "",
      rating: p.rating || 0,
      reviewCount: p.reviewCount || 0,
      bestSeller: Boolean(p.bestSeller),
      newArrival: Boolean(p.newArrival),
      productId: p.productId,
      skuId: p.skuId,
      skuName: p.skuName || p.name || "",
      taxType: p.taxType ?? null,
      taxValue: p.taxValue ?? null,
      flag: p.flag ?? "",
      pricerefer: p.pricerefer ?? p.price ?? 0,
      vendorId: p.vendorId || "",
      wishListStatus: p.wishListStatus ?? 0,
    }));
  } catch (error) {
    console.warn("Error fetching products:", error?.message || error);
    return [];
  }
}

/**
 * Fetch total product count.
 * @param {string} categorySlug - Optional category slug to scope the count
 */
export async function getProductCount(categorySlug = "") {
  try {
    const qs = categorySlug
      ? `count=1&categorySlug=${encodeURIComponent(categorySlug)}`
      : "count=1";
    const result = await getAllProductsList(qs);
    if (!result || result.status !== 1) {
      return 0;
    }
    return result?.data || 0;
  } catch (error) {
    console.warn("Error fetching product count:", error?.message || error);
    return 0;
  }
}

export async function getFacets(categorySlug = "") {
  try {
    const filterResult = categorySlug ? await getfilter(categorySlug) : { status: 0 };

    let colors = [];
    let materials = [];
    let categories = {};
    let priceRange = { min: 0, max: 100000 };

    if (filterResult?.status === 1 && Array.isArray(filterResult?.data)) {
      filterResult.data.forEach((section) => {
        if (section.sectionItem && section.sectionItem.length > 0) {
          const sectionName = (section.sectionName || "").toLowerCase();
          if (sectionName.includes("color") || sectionName.includes("colour")) {
            colors = section.sectionItem.map((item) => item.itemName);
          } else if (sectionName.includes("material")) {
            materials = section.sectionItem.map((item) => item.itemName);
          }
        }
      });
    }

    if (isSpurtAdapter()) {
      try {
        const priceResult = await axiosInstance.get("store-list/product-count");
        if (priceResult && priceResult.data.status == 1) {
          priceRange.max = priceResult.data.data?.maximumProductPrice || 100000;
        }
      } catch {
        // Keep default max price
      }
    }

    return { colors, materials, categories, priceRange };
  } catch (error) {
    console.warn("Error fetching facets:", error?.message || error);
    return { colors: [], materials: [], categories: {}, priceRange: { min: 0, max: 100000 } };
  }
}

/**
 * Fetch and return the store's category list for template usage.
 * Returns an array of { slug, name, image, containerName, count } objects.
 */
export async function getCategories() {
  try {
    const result = await getCategoryList();
    if (!result || (result.status !== undefined && result.status !== 1)) {
      return [];
    }
    const fetched = Array.isArray(result)
      ? result
      : (result?.status === 1 && Array.isArray(result?.data))
        ? result.data
        : [];

    return fetched.map((c) => {
      const rawDesc =
        c.categoryDescriptionTrans ||
        c.categoryDescription ||
        c.description ||
        c.metaTagDescription ||
        "";
      const cleanBlurb = rawDesc
        ? String(rawDesc)
            .replace(/<[^>]+>/g, "")
            .trim()
        : "";

      return {
        ...c,
        slug: c.categorySlug || c.slug || c.handle || "",
        name: cleanText(c.categoryNameTrans || c.categoryName || c.name || ""),
        image: c.image || "",
        containerName: c.imagePath || c.containerName || "category/",
        count: c.productCount || c.count || 0,
        categoryDescription: rawDesc,
        description: rawDesc,
        blurb: cleanBlurb,
      };
    });
  } catch (error) {
    console.warn("Error fetching categories:", error?.message || error);
    return [];
  }
}

export { formatINR, cleanText, decodeHtmlEntities } from "@/utilities/helper";
