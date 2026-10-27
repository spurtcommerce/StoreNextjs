import { getAllProductsList } from "@/api/ProductsApi";
import { getfilter } from "@/api/ProductDetailApi";
import { getCategoryList } from "@/api/TopCategoriesApi";
import axiosInstance from "@/api/interceptor";
import { isSpurtAdapter } from "@/config/adapter.config";

export function onImgError(e) {
  e.target.src = "/img/no-image.png";
  e.target.onerror = null;
}

/**
 * Fetch and normalise the product list.
 * @param {string} queryParams  - Raw query string, e.g. "limit=200&offset=0&categorySlug=chairs"
 */
export async function getProducts(queryParams = "limit=200&offset=0") {
  try {
    const result = await getAllProductsList(queryParams);
    const fetched = result?.status === 1 ? result?.data || [] : [];

    return fetched.map((p) => ({
      slug: p.productSlug || p.slug || String(p.productId || p.skuId || Math.random()),
      name: p.skuName || p.name || p.productName,
      description: p.description || p.shortDescription || "",
      price: p.price || 0,
      originalPrice: p.comparePrice || p.originalPrice || 0,
      image: p.image || "",
      images: p.image ? [p.image] : [],
      containerName: p.containerName || "",
      colors: p.colors || [],
      materials: p.materials || [],
      category: p.category || p.categoryName || "",
      categorySlug: p.categorySlug || "",
      rating: p.rating || 0,
      reviewCount: p.reviewCount || p.reviews || 0,
      bestSeller: p.bestSeller || false,
      newArrival: p.newArrival || false,
      productId: p.productId,
      skuId: p.skuId,
      skuName: p.skuName || "",
      taxType: p.taxType,
      taxValue: p.taxValue,
      flag: p.flag,
      pricerefer: p.pricerefer,
      vendorId: p.vendorId || "",
      wishListStatus: p.wishListStatus,
    }));
  } catch (error) {
    console.error("Error fetching products:", error);
    return [];
  }
}

/**
 * Fetch total product count.
 * @param {string} categorySlug  - Optional category slug to scope the count
 */
export async function getProductCount(categorySlug = "") {
  try {
    const qs = categorySlug
      ? `count=1&categorySlug=${encodeURIComponent(categorySlug)}`
      : "count=1";
    const result = await getAllProductsList(qs);
    if (result?.status === 1) {
      return result?.data || 0;
    }
    return 0;
  } catch (error) {
    console.error("Error fetching product count:", error);
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
    console.error("Error fetching facets:", error);
    return { colors: [], materials: [], categories: {}, priceRange: { min: 0, max: 100000 } };
  }
}

/**
 * Fetch and normalize the store's category list for bazaar template usage.
 * Returns an array of { slug, name, image, containerName, count } objects.
 */
export async function getCategories() {
  try {
    const result = await getCategoryList();
    const fetched = result?.status === 1 ? result?.data || [] : [];

    return fetched.map((c) => ({
      slug: c.categorySlug || c.slug || "",
      name: c.categoryName || c.name || "",
      image: c.image || "",
      // The category API returns the image bucket path as `imagePath` (not `containerName`)
      containerName: c.imagePath || c.containerName || "",
      count: c.productCount || c.count || 0,
    }));
  } catch (error) {
    console.error("Error fetching categories:", error);
    return [];
  }
}

export { formatINR } from "@/utilities/helper";
