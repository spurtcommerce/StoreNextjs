/**
 * @typedef {Object} ProductListParams
 * @property {number} [limit=20]
 * @property {number} [offset=0]
 * @property {string|number} [categoryId]
 * @property {string} [keyword]
 * @property {string} [currencyCode]
 * @property {string} [regionId]
 */

/**
 * Creates a normalized CommonProductRow DTO with Spurt canonical field defaults
 * @param {Partial<CommonProductRow>} partial
 * @returns {CommonProductRow}
 */
export const createCommonProductRow = (partial = {}) => {
  const imageUrl =
    partial.image ??
    (Array.isArray(partial.productImage)
      ? partial.productImage[0]?.image
      : partial.productImage?.image) ??
    null;
  const productImageObj = partial.productImage
    ? partial.productImage
    : imageUrl
    ? { containerName: partial.containerName || "", image: imageUrl, defaultImage: 1 }
    : null;

  const rawSlug = partial.productSlug ?? partial.slug ?? String(partial.productId || partial.skuId || "");
  const rawName = partial.name ?? partial.productName ?? partial.skuName ?? "";
  const rawPrice = partial.price ?? "0.00";
  const rawOriginalPrice = partial.originalPrice ?? partial.comparePrice ?? partial.price ?? "0.00";
  const rawDesc = partial.description ?? partial.shortDescription ?? partial.productDescriptionTrans ?? "";
  const rawCategory = partial.category ?? partial.categoryName ?? "";
  const rawCategorySlug = partial.categorySlug ?? "";
  const rawReviewCount = partial.reviewCount ?? partial.reviews ?? "0";
  const rawRating = partial.rating ?? partial.ratingCount ?? "0";

  return {
    productId: partial.productId ?? "",
    name: rawName,
    slug: rawSlug,
    productSlug: rawSlug,
    description: rawDesc,
    price: rawPrice,
    originalPrice: rawOriginalPrice,
    modifiedPrice: partial.modifiedPrice ?? rawPrice,
    sku: partial.sku ?? "",
    skuId: partial.skuId ?? partial.productId ?? "",
    quantity: partial.quantity ?? 0,
    isActive: partial.isActive ?? 1,
    hasStock: partial.hasStock ?? (partial.quantity > 0 ? 1 : 0),
    stockStatusId: partial.stockStatusId ?? null,
    stockStatus: partial.stockStatus ?? (partial.quantity > 0 ? "inStock" : "outOfStock"),
    createdDate: partial.createdDate ?? new Date().toISOString(),
    vendorId: partial.vendorId ?? null,
    image: imageUrl,
    images: partial.images ?? (imageUrl ? [imageUrl] : []),
    productImage: productImageObj,
    productImages: partial.productImages ?? (imageUrl ? [{ containerName: partial.containerName || "", image: imageUrl }] : []),
    containerName: partial.containerName ?? "",
    variantCount: partial.variantCount ?? 1,
    rating: rawRating,
    ratingCount: String(rawRating),
    reviewCount: String(rawReviewCount),
    category: rawCategory,
    categorySlug: rawCategorySlug,
    wishListStatus: partial.wishListStatus ?? 0,
    productNameTrans: partial.productNameTrans ?? "",
    productDescriptionTrans: partial.productDescriptionTrans ?? "",
    taxType: partial.taxType ?? null,
    taxValue: partial.taxValue ?? null,
    productDiscount: partial.productDiscount ?? null,
    productSpecial: partial.productSpecial ?? null,
    ...partial,
  };
};

/**
 * Creates a normalized CommonProductListResponse DTO
 * @param {Object} options
 * @param {number} [options.status=1]
 * @param {string} [options.message="Successfully got the complete list of products"]
 * @param {Array<Object>} [options.data=[]]
 * @param {string} [options.categoryLevel=""]
 * @returns {CommonProductListResponse}
 */
export const createCommonProductListResponse = ({
  status = 1,
  message = "Successfully got the complete list of products",
  data = [],
  categoryLevel = "",
  total,
  count,
} = {}) => {
  const resolvedTotal = count !== undefined ? count : total;
  return {
    status,
    message,
    data,
    categoryLevel,
    ...(resolvedTotal !== undefined
      ? { total: resolvedTotal, count: resolvedTotal, totalCount: resolvedTotal }
      : {}),
  };
};

/**
 * Creates a normalized CommonProductDetailResponse DTO
 * @param {Object} options
 * @param {number} [options.status=1]
 * @param {string} [options.message="Successfully got product detail"]
 * @param {Object|null} [options.data=null]
 * @returns {{ status: number, message: string, data: Object|null }}
 */
export const createCommonProductDetailResponse = ({
  status = 1,
  message = "Successfully got product detail",
  data = null,
} = {}) => {
  return {
    status,
    message,
    data,
  };
};

